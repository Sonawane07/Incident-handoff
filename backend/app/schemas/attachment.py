from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class AttachmentResponse(BaseModel):
    id: UUID
    incident_id: UUID
    filename: str
    file_type: str
    file_size: int
    storage_path: str
    uploaded_by_id: UUID
    uploaded_at: datetime
    
    class Config:
        from_attributes = True
