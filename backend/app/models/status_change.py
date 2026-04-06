from sqlalchemy import Column, Enum as SQLEnum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .base import Base
from .incident import IncidentStatus


class StatusChange(Base):
    __tablename__ = "status_changes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=False)
    from_status = Column(SQLEnum(IncidentStatus), nullable=False)
    to_status = Column(SQLEnum(IncidentStatus), nullable=False)
    changed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    incident = relationship("Incident", back_populates="status_changes")
    changed_by = relationship("User", foreign_keys=[changed_by_id])
    
    def __repr__(self):
        return f"<StatusChange {self.from_status} -> {self.to_status}>"
