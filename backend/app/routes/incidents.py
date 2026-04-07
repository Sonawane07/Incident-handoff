from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import datetime
from uuid import UUID
import math

from ..database import get_db
from ..auth import get_current_user
from ..models import Incident, User, IncidentStatus, IncidentSeverity, IncidentRole, RoleType
from ..schemas.incident import (
    IncidentCreate,
    IncidentUpdate,
    IncidentResponse,
    IncidentListResponse
)
from ..schemas.status import StatusChangeRequest, StatusChangeResponse
from ..services.status_machine import is_valid_transition, StatusTransitionError
from ..models import StatusChange

router = APIRouter()


@router.post("/", response_model=IncidentResponse, status_code=201)
async def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new incident. Creator becomes the commander."""
    
    # Create incident
    incident = Incident(
        title=incident_data.title,
        description=incident_data.description,
        severity=IncidentSeverity(incident_data.severity),
        status=IncidentStatus.DETECTED,
        commander_id=current_user.id
    )
    
    db.add(incident)
    db.flush()  # Get the incident ID
    
    # Add commander role
    commander_role = IncidentRole(
        incident_id=incident.id,
        user_id=current_user.id,
        role=RoleType.COMMANDER,
        assigned_by_id=current_user.id
    )
    db.add(commander_role)
    
    db.commit()
    db.refresh(incident)
    
    return incident


@router.get("/", response_model=IncidentListResponse)
async def list_incidents(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    q: Optional[str] = None,  # Search query
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List incidents with pagination and filtering."""
    
    query = db.query(Incident)
    
    # Apply filters
    if status:
        query = query.filter(Incident.status == IncidentStatus(status))
    
    if severity:
        query = query.filter(Incident.severity == IncidentSeverity(severity))
    
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                Incident.title.ilike(search_term),
                Incident.description.ilike(search_term)
            )
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    incidents = query.order_by(Incident.created_at.desc()).offset(offset).limit(per_page).all()
    
    # Calculate total pages
    total_pages = math.ceil(total / per_page) if total > 0 else 1
    
    return {
        "data": incidents,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get incident by ID."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return incident


@router.patch("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: UUID,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update incident details. Only commander can update."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check if user is commander
    if incident.commander_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only commander can update incident")
    
    # Update fields
    if incident_data.title is not None:
        incident.title = incident_data.title
    if incident_data.description is not None:
        incident.description = incident_data.description
    if incident_data.severity is not None:
        incident.severity = IncidentSeverity(incident_data.severity)
    
    db.commit()
    db.refresh(incident)
    
    return incident


@router.delete("/{incident_id}", status_code=204)
async def delete_incident(
    incident_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete incident. Only commander or admin can delete."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions
    if incident.commander_id != current_user.id and current_user.global_role != "admin":
        raise HTTPException(status_code=403, detail="Only commander or admin can delete incident")
    
    db.delete(incident)
    db.commit()
    
    return None


@router.post("/{incident_id}/status", response_model=StatusChangeResponse, status_code=200)
async def change_incident_status(
    incident_id: UUID,
    status_data: StatusChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change incident status. Only commander can change status."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check if user is commander
    if incident.commander_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only commander can change status")
    
    # Parse and validate new status
    try:
        new_status = IncidentStatus(status_data.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {status_data.status}")
    
    # Check if transition is valid
    if not is_valid_transition(incident.status, new_status):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from {incident.status.value} to {new_status.value}"
        )
    
    # Create status change record
    status_change = StatusChange(
        incident_id=incident.id,
        from_status=incident.status,
        to_status=new_status,
        changed_by_id=current_user.id
    )
    db.add(status_change)
    
    # Update incident status
    old_status = incident.status
    incident.status = new_status
    
    # If resolved, set resolved_at timestamp
    if new_status == IncidentStatus.RESOLVED:
        incident.resolved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(status_change)
    
    return status_change
