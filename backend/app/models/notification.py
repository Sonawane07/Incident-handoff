from sqlalchemy import Column, String, Enum as SQLEnum, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime
from .base import Base


class NotificationType(str, enum.Enum):
    INCIDENT_CREATED = "incident_created"
    SEVERITY_ESCALATED = "severity_escalated"
    COMMANDER_TRANSFERRED = "commander_transferred"
    AI_SUMMARY_READY = "ai_summary_ready"
    INCIDENT_RESOLVED = "incident_resolved"
    ADDED_TO_INCIDENT = "added_to_incident"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    message = Column(String(500), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    incident = relationship("Incident", back_populates="notifications")
    
    def __repr__(self):
        return f"<Notification {self.type} for user {self.user_id}>"
