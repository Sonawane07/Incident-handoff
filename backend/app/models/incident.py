from sqlalchemy import Column, String, Text, Enum as SQLEnum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from .base import Base, TimestampMixin


class IncidentStatus(str, enum.Enum):
    DETECTED = "detected"
    ACKNOWLEDGED = "acknowledged"
    MITIGATING = "mitigating"
    RESOLVED = "resolved"
    POSTMORTEM = "postmortem"


class IncidentSeverity(str, enum.Enum):
    SEV1 = "SEV1"
    SEV2 = "SEV2"
    SEV3 = "SEV3"
    SEV4 = "SEV4"


class Incident(Base, TimestampMixin):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(SQLEnum(IncidentSeverity), nullable=False)
    status = Column(SQLEnum(IncidentStatus), default=IncidentStatus.DETECTED, nullable=False)
    commander_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    commander = relationship("User", foreign_keys=[commander_id])
    roles = relationship("IncidentRole", back_populates="incident", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="incident", cascade="all, delete-orphan")
    status_changes = relationship("StatusChange", back_populates="incident", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="incident", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="incident", cascade="all, delete-orphan")
    ai_summaries = relationship("AISummary", back_populates="incident", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="incident", cascade="all, delete-orphan")
    webhook_deliveries = relationship("WebhookDelivery", back_populates="incident", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="incident", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Incident {self.title} ({self.severity})>"
