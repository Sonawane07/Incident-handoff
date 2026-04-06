from sqlalchemy import Column, String, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from .base import Base, TimestampMixin


class GlobalRole(str, enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    global_role = Column(SQLEnum(GlobalRole), default=GlobalRole.MEMBER, nullable=False)
    
    def __repr__(self):
        return f"<User {self.email}>"
