from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ..database import get_db
from ..auth import get_current_user, check_incident_permission
from ..models import Attachment, Incident, User
from ..schemas.attachment import AttachmentResponse
from ..services.storage import upload_file, delete_file

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/{incident_id}/attachments", response_model=AttachmentResponse, status_code=201)
async def upload_attachment(
    incident_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload an attachment. Commander or responder can upload."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions
    if not check_incident_permission(current_user, incident, "responder"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check file size
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File size exceeds {MAX_FILE_SIZE / 1024 / 1024}MB limit")
    
    # Upload to Supabase Storage
    try:
        storage_path = await upload_file(file_content, file.filename, str(incident_id))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
    
    # Create attachment record
    attachment = Attachment(
        incident_id=incident_id,
        filename=file.filename,
        file_type=file.content_type or "application/octet-stream",
        file_size=file_size,
        storage_path=storage_path,
        uploaded_by_id=current_user.id
    )
    
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    
    return attachment


@router.get("/{incident_id}/attachments", response_model=List[AttachmentResponse])
async def list_attachments(
    incident_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all attachments for an incident."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check permissions
    if not check_incident_permission(current_user, incident, "viewer"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    attachments = db.query(Attachment).filter(
        Attachment.incident_id == incident_id
    ).order_by(Attachment.uploaded_at.desc()).all()
    
    return attachments


@router.delete("/{incident_id}/attachments/{attachment_id}", status_code=204)
async def delete_attachment(
    incident_id: UUID,
    attachment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an attachment. Only uploader or commander can delete."""
    
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    attachment = db.query(Attachment).filter(
        Attachment.id == attachment_id,
        Attachment.incident_id == incident_id
    ).first()
    
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    # Check permissions (uploader or commander)
    if attachment.uploaded_by_id != current_user.id and incident.commander_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only uploader or commander can delete attachment")
    
    # Delete from storage
    await delete_file(attachment.storage_path)
    
    # Delete from database
    db.delete(attachment)
    db.commit()
    
    return None
