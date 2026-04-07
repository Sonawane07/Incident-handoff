from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ..database import get_db
from ..auth import get_current_user
from ..models import IncidentRole, Incident, User, RoleType
from ..schemas.role import RoleAssignRequest, RoleResponse, TransferCommanderRequest

router = APIRouter()


@router.post("/{incident_id}/roles", response_model=RoleResponse, status_code=201)
async def assign_role(
    incident_id: UUID,
    role_data: RoleAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Assign a role to a user. Only commander can assign roles."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check if current user is commander
    if incident.commander_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only commander can assign roles")
    
    # Check if user exists
    user = db.query(User).filter(User.id == role_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user already has a role
    existing_role = db.query(IncidentRole).filter(
        IncidentRole.incident_id == incident_id,
        IncidentRole.user_id == role_data.user_id
    ).first()
    
    if existing_role:
        raise HTTPException(status_code=400, detail="User already has a role in this incident")
    
    # Create role assignment
    role = IncidentRole(
        incident_id=incident_id,
        user_id=role_data.user_id,
        role=RoleType(role_data.role),
        assigned_by_id=current_user.id
    )
    
    db.add(role)
    db.commit()
    db.refresh(role)
    
    return role


@router.get("/{incident_id}/roles", response_model=List[RoleResponse])
async def list_roles(
    incident_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all role assignments for an incident."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    roles = db.query(IncidentRole).filter(
        IncidentRole.incident_id == incident_id
    ).all()
    
    return roles


@router.delete("/{incident_id}/roles/{user_id}", status_code=204)
async def remove_role(
    incident_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a user's role. Only commander can remove roles."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check if current user is commander
    if incident.commander_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only commander can remove roles")
    
    # Cannot remove commander's role
    if user_id == incident.commander_id:
        raise HTTPException(status_code=400, detail="Cannot remove commander role. Transfer commander first.")
    
    role = db.query(IncidentRole).filter(
        IncidentRole.incident_id == incident_id,
        IncidentRole.user_id == user_id
    ).first()
    
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    db.delete(role)
    db.commit()
    
    return None


@router.post("/{incident_id}/transfer-commander", status_code=200)
async def transfer_commander(
    incident_id: UUID,
    transfer_data: TransferCommanderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Transfer commander role to another team member."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check if current user is commander
    if incident.commander_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only current commander can transfer role")
    
    # Check if new commander is on the team
    new_commander_role = db.query(IncidentRole).filter(
        IncidentRole.incident_id == incident_id,
        IncidentRole.user_id == transfer_data.new_commander_id
    ).first()
    
    if not new_commander_role:
        raise HTTPException(status_code=400, detail="New commander must be a team member")
    
    # Update incident commander
    old_commander_id = incident.commander_id
    incident.commander_id = transfer_data.new_commander_id
    
    # Update roles
    new_commander_role.role = RoleType.COMMANDER
    
    # Create a responder role for old commander
    old_commander_role = IncidentRole(
        incident_id=incident_id,
        user_id=old_commander_id,
        role=RoleType.RESPONDER,
        assigned_by_id=current_user.id
    )
    db.add(old_commander_role)
    
    db.commit()
    
    return {"message": "Commander transferred successfully", "new_commander_id": str(transfer_data.new_commander_id)}
