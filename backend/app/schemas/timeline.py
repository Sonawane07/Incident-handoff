from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class TimelineEventCreate(BaseModel):
    content: str = Field(..., min_length=1)
    timestamp: Optional[datetime] = None


class TimelineEventUpdate(BaseModel):
    content: str = Field(..., min_length=1)


class TimelineEventResponse(BaseModel):
    id: UUID
    incident_id: UUID
    content: str
    event_type: str
    source: Optional[str] = None
    timestamp: datetime
    created_by_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    is_edited: bool
    
    class Config:
        from_attributes = True
