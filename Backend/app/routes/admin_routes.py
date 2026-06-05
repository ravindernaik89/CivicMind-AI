# app/routes/admin_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.complaint import Complaint
from app.models.department import Department
from app.schemas.user_schema import DepartmentCreate, OfficerCreate
from app.services.auth_service import get_password_hash
from app.services.complaint_service import update_status
from app.services.officer_service import get_officer_for_department
from app.dependencies.auth_dependency import require_role

router = APIRouter(prefix="/admin", tags=["Admin"])


# Get dashboard statistics
@router.get("/statistics")
def get_statistics(
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN")),
):
    """Get overall system statistics for admin dashboard"""
    
    total_complaints = db.query(Complaint).count()
    pending_complaints = db.query(Complaint).filter(Complaint.status == "PENDING").count()
    resolved_complaints = db.query(Complaint).filter(Complaint.status == "RESOLVED").count()
    in_progress_complaints = db.query(Complaint).filter(Complaint.status == "IN_PROGRESS").count()
    total_citizens = db.query(User).filter(User.role == UserRole.CITIZEN).count()
    total_officers = db.query(User).filter(User.role == UserRole.OFFICER).count()
    total_departments = db.query(Department).count()
    
    return {
        "total_complaints": total_complaints,
        "pending_complaints": pending_complaints,
        "resolved_complaints": resolved_complaints,
        "in_progress_complaints": in_progress_complaints,
        "total_citizens": total_citizens,
        "total_officers": total_officers,
        "total_departments": total_departments,
    }


# Get all departments
@router.get("/departments")
def get_all_departments(
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN")),
):
    """Get all departments"""
    departments = db.query(Department).all()
    return departments


# Create new department
@router.post("/departments")
def create_department(
    request: DepartmentCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN")),
):
    """Create a new department"""
    name = request.name
    
    # Check if department already exists
    existing = db.query(Department).filter(Department.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")
    
    new_department = Department(name=name)
    db.add(new_department)
    db.commit()
    db.refresh(new_department)
    
    return new_department


# Delete department
@router.delete("/departments/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN")),
):
    """Delete a department"""
    department = db.query(Department).filter(Department.id == department_id).first()
    
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    db.delete(department)
    db.commit()
    
    return {"message": "Department deleted successfully"}


# Get all officers
@router.get("/officers")
def get_all_officers(
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN")),
):
    """Get all officers in the system"""
    officers = db.query(User).filter(User.role == UserRole.OFFICER).all()
    officers_list = []
    for officer in officers:
        department = db.query(Department).filter(Department.id == officer.department_id).first()
        officers_list.append({
            "id": officer.id,
            "name": officer.name,
            "email": officer.email,
            "role": officer.role.value,
            "department_id": officer.department_id,
            "department_name": department.name if department else None
        })
    return officers_list


# Create officer account
@router.post("/officers")
def create_officer(
    request: OfficerCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN")),
):
    """Create a new officer account (one officer per department)"""
    name = request.name
    email = request.email
    password = request.password
    department_id = request.department_id

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if department already has an officer
    existing_officer = db.query(User).filter(
        User.department_id == department_id,
        User.role == UserRole.OFFICER
    ).first()
    
    if existing_officer:
        raise HTTPException(status_code=400, detail="This department already has an officer assigned")
    
    # Verify department exists
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    hashed_password = get_password_hash(password)
    
    new_officer = User(
        name=name,
        email=email,
        password_hash=hashed_password,
        role=UserRole.OFFICER,
        department_id=department_id
    )
    
    db.add(new_officer)
    db.commit()
    db.refresh(new_officer)
    
    return {
        "id": new_officer.id,
        "name": new_officer.name,
        "email": new_officer.email,
        "role": new_officer.role.value,
        "department_id": new_officer.department_id,
        "department_name": department.name
    }


# Delete officer account
@router.delete("/officers/{officer_id}")
def delete_officer(
    officer_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN")),
):
    """Delete an officer account"""
    officer = db.query(User).filter(
        User.id == officer_id,
        User.role == UserRole.OFFICER
    ).first()
    
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    
    db.delete(officer)
    db.commit()
    
    return {"message": "Officer deleted successfully"}


# Get all complaints (admin view with full details)
@router.get("/complaints")
def get_all_complaints_admin(
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN")),
):
    """Get all complaints with full details for admin"""
    complaints = db.query(Complaint).all()
    result = []
    for complaint in complaints:
        result.append({
            "id": complaint.id,
            "description": complaint.description,
            "issue_type": complaint.issue_type,
            "severity": complaint.severity,
            "status": complaint.status,
            "created_at": complaint.created_at.isoformat() if complaint.created_at else None,
            "user_id": complaint.user_id,
            "department_id": complaint.department_id,
            "department_name": complaint.department.name if complaint.department else None,
            "assigned_officer_id": complaint.assigned_officer_id,
            "assigned_officer_name": complaint.assigned_officer.name if complaint.assigned_officer else None,
            "location_lat": complaint.location_lat,
            "location_lng": complaint.location_lng,
            "location_url": (
                f"https://www.google.com/maps/search/?api=1&query={complaint.location_lat},{complaint.location_lng}"
                if complaint.location_lat is not None and complaint.location_lng is not None else None
            ),
        })
    return result


# Update complaint status
@router.put("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN")),
):
    """Update complaint status"""
    return update_status(db, complaint_id, new_status, user)


# Assign complaint to department
@router.put("/complaints/{complaint_id}/assign")
def assign_complaint_to_department(
    complaint_id: int,
    department_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN")),
):
    """Assign complaint to a department"""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    department = db.query(Department).filter(Department.id == department_id).first()
    
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    complaint.department_id = department_id

    # If an officer already exists for this department, assign the complaint automatically.
    # Otherwise clear any previous officer assignment when the department changes.
    assigned_officer = get_officer_for_department(db, department.id)
    if assigned_officer:
        complaint.assigned_officer_id = assigned_officer.id
        complaint.status = "ASSIGNED"
    else:
        complaint.assigned_officer_id = None

    db.commit()
    db.refresh(complaint)

    if assigned_officer:
        return update_status(db, complaint_id, "ASSIGNED", user)

    return complaint


# Assign complaint to an officer
@router.put("/complaints/{complaint_id}/assign_officer")
def assign_complaint_to_officer(
    complaint_id: int,
    officer_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN")),
):
    """Assign complaint to a specific officer"""
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
    complaint.department_id = officer.department_id
    db.commit()
    db.refresh(complaint)

    return update_status(db, complaint_id, "ASSIGNED", user)


# Get all users (comprehensive user list for admin)
@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN")),
):
    """Get all users in the system with full details"""
    users = db.query(User).all()
    result = []
    for u in users:
        department = None
        if u.department_id:
            dept = db.query(Department).filter(Department.id == u.department_id).first()
            department = dept.name if dept else None
        
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role.value,
            "department_id": u.department_id,
            "department_name": department,
            "created_at": u.created_at.isoformat() if hasattr(u, 'created_at') and u.created_at else None
        })
    return result


