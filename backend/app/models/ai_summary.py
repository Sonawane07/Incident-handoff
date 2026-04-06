from sqlalchemy import Column, Text, Integer, Enum as SQLEnum, ForeignKey, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime
from .base import Base


class SummaryStatus(str, enum.Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    EDITED = "edited"
    DISCARDED = "discarded"
    FAILED = "failed"


class AISummary(Base):
    __tablename__ = "ai_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=False)
    version = Column(Integer, nullable=False)
    timeline_narrative = Column(Text, nullable=False)
    next_steps = Column(ARRAY(Text), nullable=False)
    status = Column(SQLEnum(SummaryStatus), default=SummaryStatus.DRAFT, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    approved_at = Column(DateTime, nullable=True)
    approved_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    incident = relationship("Incident", back_populates="ai_summaries")
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    
    def __repr__(self):
        return f"<AISummary v{self.version} for incident {self.incident_id}>"
