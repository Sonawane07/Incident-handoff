from openai import OpenAI
from sqlalchemy.orm import Session
from datetime import datetime
import json
from typing import Dict, Any

from ..config import settings
from ..models import (
    Incident, TimelineEvent, Comment, Attachment,
    AISummary, SummaryStatus
)

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def gather_incident_evidence(db: Session, incident_id: str) -> Dict[str, Any]:
    """Gather all relevant incident data for AI summarization."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise ValueError(f"Incident {incident_id} not found")
    
    # Get timeline events
    timeline_events = db.query(TimelineEvent).filter(
        TimelineEvent.incident_id == incident_id
    ).order_by(TimelineEvent.timestamp.asc()).all()
    
    # Get comments
    comments = db.query(Comment).filter(
        Comment.incident_id == incident_id
    ).order_by(Comment.created_at.asc()).all()
    
    # Get attachments (metadata only)
    attachments = db.query(Attachment).filter(
        Attachment.incident_id == incident_id
    ).all()
    
    return {
        "incident": {
            "title": incident.title,
            "description": incident.description,
            "severity": incident.severity.value,
            "status": incident.status.value,
            "created_at": incident.created_at.isoformat(),
            "resolved_at": incident.resolved_at.isoformat() if incident.resolved_at else None,
        },
        "timeline": [
            {
                "timestamp": event.timestamp.isoformat(),
                "content": event.content,
                "event_type": event.event_type.value,
                "source": event.source,
            }
            for event in timeline_events
        ],
        "comments": [
            {
                "created_at": comment.created_at.isoformat(),
                "content": comment.content,
            }
            for comment in comments
        ],
        "attachments": [
            {
                "filename": attachment.filename,
                "file_type": attachment.file_type,
                "uploaded_at": attachment.uploaded_at.isoformat(),
            }
            for attachment in attachments
        ],
    }


def generate_summary_with_openai(evidence: Dict[str, Any]) -> Dict[str, Any]:
    """Generate AI summary using OpenAI with structured JSON output."""
    
    prompt = f"""You are an incident management assistant. Analyze the following incident data and generate a comprehensive summary.

Incident Details:
- Title: {evidence['incident']['title']}
- Description: {evidence['incident']['description']}
- Severity: {evidence['incident']['severity']}
- Status: {evidence['incident']['status']}
- Created: {evidence['incident']['created_at']}
- Resolved: {evidence['incident']['resolved_at'] or 'Not yet resolved'}

Timeline Events ({len(evidence['timeline'])} events):
{json.dumps(evidence['timeline'], indent=2)}

Comments ({len(evidence['comments'])} comments):
{json.dumps(evidence['comments'], indent=2)}

Attachments ({len(evidence['attachments'])} files):
{json.dumps(evidence['attachments'], indent=2)}

Generate a structured summary with the following sections:
1. Executive Summary (2-3 sentences)
2. Root Cause (if identifiable)
3. Impact Assessment
4. Actions Taken (bullet points)
5. Recommendations (bullet points)

Respond ONLY with valid JSON matching this exact structure:
{{
  "executive_summary": "string",
  "root_cause": "string or null",
  "impact": "string",
  "actions_taken": ["string", "string", ...],
  "recommendations": ["string", "string", ...]
}}"""

    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert incident management assistant. Always respond with valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        summary_data = json.loads(content)
        
        # Validate structure
        required_keys = ["executive_summary", "root_cause", "impact", "actions_taken", "recommendations"]
        for key in required_keys:
            if key not in summary_data:
                raise ValueError(f"Missing required key: {key}")
        
        return summary_data
    
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")


def create_ai_summary(db: Session, incident_id: str) -> AISummary:
    """Main function to generate and save AI summary."""
    
    # Gather evidence
    evidence = gather_incident_evidence(db, incident_id)
    
    # Generate summary with OpenAI
    summary_data = generate_summary_with_openai(evidence)
    
    # Create AISummary record
    ai_summary = AISummary(
        incident_id=incident_id,
        executive_summary=summary_data["executive_summary"],
        root_cause=summary_data.get("root_cause"),
        impact=summary_data["impact"],
        actions_taken=summary_data["actions_taken"],
        recommendations=summary_data["recommendations"],
        status=SummaryStatus.PENDING,
        generated_at=datetime.utcnow()
    )
    
    db.add(ai_summary)
    db.commit()
    db.refresh(ai_summary)
    
    return ai_summary
