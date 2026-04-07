from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    severity: str = Field(..., pattern="^(SEV1|SEV2|SEV3|SEV4)$")


class IncidentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    severity: Optional[str] = Field(None, pattern="^(SEV1|SEV2|SEV3|SEV4)$")


class IncidentResponse(BaseModel):
    id: UUID
    title: str
    description: str
    severity: str
    status: str
    commander_id: UUID
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class IncidentListResponse(BaseModel):
    data: List[IncidentResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class StatusChangeRequest(BaseModel):
    status: str = Field(..., pattern="^(detected|acknowledged|mitigating|resolved|postmortem)$")
