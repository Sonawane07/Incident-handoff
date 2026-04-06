from sqlalchemy import Column, String, Text, Enum as SQLEnum, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime
from .base import Base, TimestampMixin


class EventType(str, enum.Enum):
    MANUAL = "manual"
    WEBHOOK = "webhook"
    AI_GENERATED = "ai_generated"


class TimelineEvent(Base, TimestampMixin):
    __tablename__ = "timeline_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=False)
    content = Column(Text, nullable=False)
    event_type = Column(SQLEnum(EventType), default=EventType.MANUAL, nullable=False)
    source = Column(String(100), nullable=True)  # e.g., "pagerduty", "sentry"
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    is_edited = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    incident = relationship("Incident", back_populates="timeline_events")
    created_by = relationship("User", foreign_keys=[created_by_id])
    
    def __repr__(self):
        return f"<TimelineEvent {self.event_type} for incident {self.incident_id}>"
