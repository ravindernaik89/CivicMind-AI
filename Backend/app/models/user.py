# app/models/user.py

from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime
from app.database import Base
import enum
from datetime import datetime


class UserRole(str, enum.Enum):
    CITIZEN = "CITIZEN"
    OFFICER = "OFFICER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CITIZEN, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Department assignment for officers
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
