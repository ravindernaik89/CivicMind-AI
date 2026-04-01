# app/services/officer_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User, UserRole
from app.models.complaint import Complaint
from app.utils.security import hash_password


# Get officer by ID
def get_officer_by_id(db: Session, officer_id: int):
    """Get officer details by ID"""
    officer = db.query(User).filter(
        User.id == officer_id,
        User.role == UserRole.OFFICER
    ).first()
    
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    
    return officer


# Get all officers
def get_all_officers(db: Session):
    """Get all officers in the system"""
    return db.query(User).filter(User.role == UserRole.OFFICER).all()


# Get complaints assigned to officer
def get_officer_complaints(db: Session, officer_id: int):
    """Get all complaints assigned to a specific officer"""
    return db.query(Complaint).filter(
        Complaint.assigned_officer_id == officer_id
    ).all()


# Get officer by department
def get_officer_for_department(db: Session, department_id: int):
    """Get a single officer for a department"""
    return db.query(User).filter(
        User.role == UserRole.OFFICER,
        User.department_id == department_id
    ).first()


# Get complaints by department for officer
def get_department_complaints(db: Session, department_id: int):
    """Get all complaints for a department (for officers)"""
    return db.query(Complaint).filter(
        Complaint.department_id == department_id
    ).all()


# Assign complaint to officer
def assign_complaint_to_officer(db: Session, complaint_id: int, officer_id: int):
    """Assign a complaint to an officer"""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    officer = db.query(User).filter(
        User.id == officer_id,
        User.role == UserRole.OFFICER
    ).first()
    
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    
    complaint.assigned_officer_id = officer_id
    complaint.status = "ASSIGNED"
    db.commit()
    db.refresh(complaint)
    
    return complaint


# Update officer's department
def update_officer_department(db: Session, officer_id: int, department_id: int):
    """Update officer's department assignment"""
    officer = db.query(User).filter(
        User.id == officer_id,
        User.role == UserRole.OFFICER
    ).first()
    
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    
    officer.department_id = department_id
    db.commit()
    db.refresh(officer)
    
    return officer

