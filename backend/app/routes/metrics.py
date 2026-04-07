from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from ..database import get_db
from ..auth import get_current_user
from ..models import (
    Incident, IncidentStatus, IncidentSeverity,
    AISummary, SummaryStatus,
    WebhookDelivery, WebhookStatus,
    User
)

router = APIRouter()


@router.get("/")
async def get_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard metrics."""
    
    # Open incidents by severity
    open_statuses = [IncidentStatus.DETECTED, IncidentStatus.ACKNOWLEDGED, IncidentStatus.MITIGATING]
    
    sev1_count = db.query(Incident).filter(
        Incident.severity == IncidentSeverity.SEV1,
        Incident.status.in_(open_statuses)
    ).count()
    
    sev2_count = db.query(Incident).filter(
        Incident.severity == IncidentSeverity.SEV2,
        Incident.status.in_(open_statuses)
    ).count()
    
    sev3_count = db.query(Incident).filter(
        Incident.severity == IncidentSeverity.SEV3,
        Incident.status.in_(open_statuses)
    ).count()
    
    sev4_count = db.query(Incident).filter(
        Incident.severity == IncidentSeverity.SEV4,
        Incident.status.in_(open_statuses)
    ).count()
    
    # MTTR calculation (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    resolved_incidents = db.query(Incident).filter(
        Incident.status == IncidentStatus.RESOLVED,
        Incident.resolved_at >= thirty_days_ago
    ).all()
    
    mttr_values = []
    for incident in resolved_incidents:
        if incident.resolved_at:
            duration = (incident.resolved_at - incident.created_at).total_seconds() / 60
            mttr_values.append(duration)
    
    average_mttr = sum(mttr_values) / len(mttr_values) if mttr_values else 0
    
    # MTTR trend (last 7 days)
    mttr_trend = []
    for i in range(7):
        day = datetime.utcnow() - timedelta(days=6-i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_resolved = db.query(Incident).filter(
            Incident.status == IncidentStatus.RESOLVED,
            Incident.resolved_at >= day_start,
            Incident.resolved_at < day_end
        ).all()
        
        day_mttr = 0
        if day_resolved:
            day_durations = [
                (inc.resolved_at - inc.created_at).total_seconds() / 60
                for inc in day_resolved if inc.resolved_at
            ]
            day_mttr = sum(day_durations) / len(day_durations) if day_durations else 0
        
        mttr_trend.append({
            "date": day.strftime("%Y-%m-%d"),
            "value": round(day_mttr, 2)
        })
    
    # AI Summary stats
    total_generated = db.query(AISummary).count()
    approved = db.query(AISummary).filter(AISummary.status == SummaryStatus.APPROVED).count()
    discarded = db.query(AISummary).filter(AISummary.status == SummaryStatus.DISCARDED).count()
    acceptance_rate = (approved / total_generated * 100) if total_generated > 0 else 0
    
    # Webhook stats
    total_webhooks = db.query(WebhookDelivery).count()
    processed_webhooks = db.query(WebhookDelivery).filter(
        WebhookDelivery.status == WebhookStatus.PROCESSED
    ).count()
    failed_webhooks = db.query(WebhookDelivery).filter(
        WebhookDelivery.status == WebhookStatus.FAILED
    ).count()
    webhook_success_rate = (processed_webhooks / total_webhooks * 100) if total_webhooks > 0 else 100
    
    return {
        "open_incidents": {
            "sev1": sev1_count,
            "sev2": sev2_count,
            "sev3": sev3_count,
            "sev4": sev4_count,
            "total": sev1_count + sev2_count + sev3_count + sev4_count
        },
        "mttr": {
            "average_minutes": round(average_mttr, 2),
            "trend": mttr_trend
        },
        "ai_summary": {
            "total_generated": total_generated,
            "approved": approved,
            "discarded": discarded,
            "acceptance_rate": round(acceptance_rate, 2)
        },
        "webhook_stats": {
            "total_received": total_webhooks,
            "processed": processed_webhooks,
            "failed": failed_webhooks,
            "success_rate": round(webhook_success_rate, 2)
        }
    }
