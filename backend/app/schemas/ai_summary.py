from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID


class AISummaryResponse(BaseModel):
    id: UUID
    incident_id: UUID
    executive_summary: str
    root_cause: Optional[str] = None
    impact: str
    actions_taken: List[str]
    recommendations: List[str]
    status: str
    generated_at: datetime
    approved_at: Optional[datetime] = None
    approved_by_id: Optional[UUID] = None
    discarded_at: Optional[datetime] = None
    discarded_by_id: Optional[UUID] = None
    
    class Config:
        from_attributes = True


class AISummaryUpdate(BaseModel):
    executive_summary: Optional[str] = None
    root_cause: Optional[str] = None
    impact: Optional[str] = None
    actions_taken: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None


class GenerateSummaryResponse(BaseModel):
    message: str
    task_id: str
