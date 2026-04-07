from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from uuid import UUID


class RoleAssignRequest(BaseModel):
    user_id: UUID
    role: str = Field(..., pattern="^(responder|viewer)$")


class RoleResponse(BaseModel):
    id: UUID
    incident_id: UUID
    user_id: UUID
    role: str
    assigned_at: datetime
    assigned_by_id: UUID
    
    class Config:
        from_attributes = True


class TransferCommanderRequest(BaseModel):
    new_commander_id: UUID
