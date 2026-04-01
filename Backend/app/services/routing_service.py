# app/services/routing_service.py

from app.models.department import Department


# Default departments to create if they don't exist
DEFAULT_DEPARTMENTS = [
    "Roads Department",
    "Sanitation Department",
    "Water Supply Department",
    "General Department",
    "Electricity Department",
    "Parks Department",
]


def ensure_default_departments(db):
    """Create default departments if they don't exist"""
    for dept_name in DEFAULT_DEPARTMENTS:
        existing = db.query(Department).filter(Department.name == dept_name).first()
        if not existing:
            new_dept = Department(name=dept_name)
            db.add(new_dept)
    db.commit()


def route_to_department(db, issue_type: str):

    mapping = {
        "road_issue": "Roads Department",
        "garbage": "Sanitation Department",
        "water_leak": "Water Supply Department",
        "electricity": "Electricity Department",
        "parks": "Parks Department",
        "person": "General Department",
        "car": "Roads Department",
        "truck": "Roads Department",
        "bottle": "Sanitation Department",
        "general": "General Department",
    }

    dept_name = mapping.get(issue_type.lower(), "General Department")

    # First ensure default departments exist
    ensure_default_departments(db)

    department = db.query(Department).filter(
        Department.name == dept_name
    ).first()

    # If still not found, use General Department
    if not department:
        department = db.query(Department).filter(
            Department.name == "General Department"
        ).first()

    return department
