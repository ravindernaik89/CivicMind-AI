# app/routes/officer_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.auth_dependency import require_role
from app.services.officer_service import (
    get_officer_complaints,
    get_department_complaints,
)
from app.services.complaint_service import update_status

router = APIRouter(prefix="/officer", tags=["Officer"])


# Get officer's assigned complaints
@router.get("/complaints")
def get_my_complaints(
    db: Session = Depends(get_db),
    officer=Depends(require_role("OFFICER")),
):
    """Get complaints assigned to the logged-in officer"""
    return get_officer_complaints(db, officer.id)


# Get complaints by department
@router.get("/complaints/department")
def get_department_complaints_route(
    db: Session = Depends(get_db),
    officer=Depends(require_role("OFFICER")),
):
    """Get all complaints for the officer's department"""
    if not officer.department_id:
        return {"message": "No department assigned to this officer"}
    
    return get_department_complaints(db, officer.department_id)


# Get officer profile
@router.get("/profile")
def get_officer_profile(
    db: Session = Depends(get_db),
    officer=Depends(require_role("OFFICER")),
):
    """Get current officer's profile"""
    return {
        "id": officer.id,
        "name": officer.name,
        "email": officer.email,
        "role": officer.role.value if hasattr(officer.role, "value") else officer.role,
        "department_id": officer.department_id
    }


# Update complaint status (officer can update their assigned complaints)
@router.put("/complaints/{complaint_id}/status")
def update_complaint_status_officer(
    complaint_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    officer=Depends(require_role("OFFICER")),
):
    """Update status of a complaint assigned to this officer"""
    # First check if complaint is assigned to this officer
    from app.models.complaint import Complaint
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.assigned_officer_id == officer.id
    ).first()
    
    if not complaint:
        raise HTTPException(
            status_code=403, 
            detail="You can only update complaints assigned to you"
        )
    
    return update_status(db, complaint_id, new_status, officer)

