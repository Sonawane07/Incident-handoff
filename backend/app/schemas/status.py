from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class StatusChangeRequest(BaseModel):
    status: str


class StatusChangeResponse(BaseModel):
    id: UUID
    incident_id: UUID
    from_status: str
    to_status: str
    changed_by_id: UUID
    changed_at: datetime
    
    class Config:
        from_attributes = True
