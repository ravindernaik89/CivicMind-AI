# app/models/complaint.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    issue_type = Column(String(100), nullable=True)
    severity = Column(String(50), nullable=True)
    status = Column(String(50), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    # Assigned officer for the complaint
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    department = relationship("Department")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id])

    # ✅ ADD THIS RELATIONSHIP
    status_histories = relationship(
        "StatusHistory",
        back_populates="complaint",
        cascade="all, delete-orphan"
    )
