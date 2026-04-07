from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ..database import get_db
from ..auth import get_current_user, check_incident_permission
from ..models import Comment, Incident, User
from ..schemas.comment import CommentCreate, CommentResponse

router = APIRouter()


@router.post("/{incident_id}/comments", response_model=CommentResponse, status_code=201)
async def create_comment(
    incident_id: UUID,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a comment. Any team member (viewer, responder, commander) can comment."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions (any role can comment)
    if not check_incident_permission(current_user, incident, "viewer"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Create comment
    comment = Comment(
        incident_id=incident_id,
        content=comment_data.content,
        author_id=current_user.id
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return comment


@router.get("/{incident_id}/comments", response_model=List[CommentResponse])
async def list_comments(
    incident_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all comments for an incident."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions
    if not check_incident_permission(current_user, incident, "viewer"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    comments = db.query(Comment).filter(
        Comment.incident_id == incident_id
    ).order_by(Comment.created_at.asc()).all()
    
    return comments


@router.delete("/{incident_id}/comments/{comment_id}", status_code=204)
async def delete_comment(
    incident_id: UUID,
    comment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment. Only author or commander can delete."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.incident_id == incident_id
    ).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check permissions (author or commander)
    if comment.author_id != current_user.id and incident.commander_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only author or commander can delete comment")
    
    db.delete(comment)
    db.commit()
    
    return None
