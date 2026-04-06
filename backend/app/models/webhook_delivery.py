from sqlalchemy import Column, String, Enum as SQLEnum, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime
from .base import Base


class WebhookStatus(str, enum.Enum):
    RECEIVED = "received"
    PROCESSED = "processed"
    FAILED = "failed"


class WebhookSourceType(str, enum.Enum):
    GENERIC = "generic"
    PAGERDUTY = "pagerduty"
    SENTRY = "sentry"


class WebhookDelivery(Base):
    __tablename__ = "webhook_deliveries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_type = Column(SQLEnum(WebhookSourceType), nullable=False)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=True)
    raw_payload = Column(JSON, nullable=False)
    status = Column(SQLEnum(WebhookStatus), default=WebhookStatus.RECEIVED, nullable=False)
    error_message = Column(String(1000), nullable=True)
    received_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    processed_at = Column(DateTime, nullable=True)
    
    # Relationships
    incident = relationship("Incident", back_populates="webhook_deliveries")
    
    def __repr__(self):
        return f"<WebhookDelivery {self.source_type} - {self.status}>"
