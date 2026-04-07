from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from uuid import UUID

from ..database import get_db
from ..auth import get_current_user, check_incident_permission
from ..models import AISummary, Incident, User, SummaryStatus
from ..schemas.ai_summary import (
    AISummaryResponse,
    AISummaryUpdate,
    GenerateSummaryResponse
)
from ..workers.tasks import generate_ai_summary

router = APIRouter()


@router.post("/{incident_id}/ai-summary", response_model=GenerateSummaryResponse, status_code=202)
async def enqueue_ai_summary(
    incident_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Enqueue AI summary generation task. Only commander or responder can generate."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions
    if not check_incident_permission(current_user, incident, "responder"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Enqueue Celery task
    task = generate_ai_summary.delay(str(incident_id))
    
    return {
        "message": "AI summary generation enqueued",
        "task_id": task.id
    }


@router.get("/{incident_id}/ai-summary", response_model=List[AISummaryResponse])
async def list_ai_summaries(
    incident_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all AI summary versions for an incident."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions
    if not check_incident_permission(current_user, incident, "viewer"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    summaries = db.query(AISummary).filter(
        AISummary.incident_id == incident_id
    ).order_by(AISummary.generated_at.desc()).all()
    
    return summaries


@router.get("/{incident_id}/ai-summary/{summary_id}", response_model=AISummaryResponse)
async def get_ai_summary(
    incident_id: UUID,
    summary_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific AI summary."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions
    if not check_incident_permission(current_user, incident, "viewer"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    summary = db.query(AISummary).filter(
        AISummary.id == summary_id,
        AISummary.incident_id == incident_id
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="AI summary not found")
    
    return summary


@router.patch("/{incident_id}/ai-summary/{summary_id}", response_model=AISummaryResponse)
async def update_ai_summary(
    incident_id: UUID,
    summary_id: UUID,
    summary_data: AISummaryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Edit AI summary. Only commander can edit."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions (only commander)
    if incident.commander_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only commander can edit AI summary")
    
    summary = db.query(AISummary).filter(
        AISummary.id == summary_id,
        AISummary.incident_id == incident_id
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="AI summary not found")
    
    # Update fields
    if summary_data.executive_summary is not None:
        summary.executive_summary = summary_data.executive_summary
    if summary_data.root_cause is not None:
        summary.root_cause = summary_data.root_cause
    if summary_data.impact is not None:
        summary.impact = summary_data.impact
    if summary_data.actions_taken is not None:
        summary.actions_taken = summary_data.actions_taken
    if summary_data.recommendations is not None:
        summary.recommendations = summary_data.recommendations
    
    db.commit()
    db.refresh(summary)
    
    return summary


@router.post("/{incident_id}/ai-summary/{summary_id}/approve", response_model=AISummaryResponse)
async def approve_ai_summary(
    incident_id: UUID,
    summary_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve AI summary. Only commander can approve."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions (only commander)
    if incident.commander_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only commander can approve AI summary")
    
    summary = db.query(AISummary).filter(
        AISummary.id == summary_id,
        AISummary.incident_id == incident_id
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="AI summary not found")
    
    if summary.status == SummaryStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Summary already approved")
    
    # Approve summary
    summary.status = SummaryStatus.APPROVED
    summary.approved_at = datetime.utcnow()
    summary.approved_by_id = current_user.id
    
    db.commit()
    db.refresh(summary)
    
    return summary


@router.post("/{incident_id}/ai-summary/{summary_id}/discard", response_model=AISummaryResponse)
async def discard_ai_summary(
    incident_id: UUID,
    summary_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Discard AI summary. Only commander can discard."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions (only commander)
    if incident.commander_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only commander can discard AI summary")
    
    summary = db.query(AISummary).filter(
        AISummary.id == summary_id,
        AISummary.incident_id == incident_id
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="AI summary not found")
    
    if summary.status == SummaryStatus.DISCARDED:
        raise HTTPException(status_code=400, detail="Summary already discarded")
    
    # Discard summary
    summary.status = SummaryStatus.DISCARDED
    summary.discarded_at = datetime.utcnow()
    summary.discarded_by_id = current_user.id
    
    db.commit()
    db.refresh(summary)
    
    return summary
