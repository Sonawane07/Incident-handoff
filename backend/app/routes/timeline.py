from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from uuid import UUID

from ..database import get_db
from ..auth import get_current_user, check_incident_permission
from ..models import TimelineEvent, Incident, User, EventType
from ..schemas.timeline import (
    TimelineEventCreate,
    TimelineEventUpdate,
    TimelineEventResponse
)

router = APIRouter()


@router.post("/{incident_id}/timeline", response_model=TimelineEventResponse, status_code=201)
async def create_timeline_event(
    incident_id: UUID,
    event_data: TimelineEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a timeline event. Commander or responder can add events."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions (responder or commander)
    if not check_incident_permission(current_user, incident, "responder"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Create timeline event
    event = TimelineEvent(
        incident_id=incident_id,
        content=event_data.content,
        event_type=EventType.MANUAL,
        timestamp=event_data.timestamp or datetime.utcnow(),
        created_by_id=current_user.id
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    return event


@router.get("/{incident_id}/timeline", response_model=List[TimelineEventResponse])
async def list_timeline_events(
    incident_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all timeline events for an incident."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions (any role can view)
    if not check_incident_permission(current_user, incident, "viewer"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    events = db.query(TimelineEvent).filter(
        TimelineEvent.incident_id == incident_id
    ).order_by(TimelineEvent.timestamp.asc()).all()
    
    return events


@router.patch("/{incident_id}/timeline/{event_id}", response_model=TimelineEventResponse)
async def update_timeline_event(
    incident_id: UUID,
    event_id: UUID,
    event_data: TimelineEventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a timeline event. Only the creator or commander can edit."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    event = db.query(TimelineEvent).filter(
        TimelineEvent.id == event_id,
        TimelineEvent.incident_id == incident_id
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Timeline event not found")
    
    # Check permissions (creator or commander)
    if event.created_by_id != current_user.id and incident.commander_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only creator or commander can edit event")
    
    # Update event
    event.content = event_data.content
    event.is_edited = True
    
    db.commit()
    db.refresh(event)
    
    return event


@router.delete("/{incident_id}/timeline/{event_id}", status_code=204)
async def delete_timeline_event(
    incident_id: UUID,
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a timeline event. Only the creator or commander can delete."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    event = db.query(TimelineEvent).filter(
        TimelineEvent.id == event_id,
        TimelineEvent.incident_id == incident_id
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Timeline event not found")
    
    # Check permissions (creator or commander)
    if event.created_by_id != current_user.id and incident.commander_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only creator or commander can delete event")
    
    db.delete(event)
    db.commit()
    
    return None
