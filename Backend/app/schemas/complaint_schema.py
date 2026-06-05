# app/schemas/complaint_schema.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ComplaintCreate(BaseModel):
    description: str


class ComplaintResponse(BaseModel):
    id: int
    description: str
    issue_type: Optional[str] = None
    severity: Optional[str] = None
    status: str
    created_at: datetime
    user_id: Optional[int] = None
    department_id: Optional[int] = None
    assigned_officer_id: Optional[int] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None

    class Config:
        from_attributes = True
