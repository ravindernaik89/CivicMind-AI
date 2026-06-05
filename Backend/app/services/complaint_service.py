# app/services/complaint_service.py

import os
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.models.complaint import Complaint
from app.models.status_history import StatusHistory
from app.services.notification_service import notify_user
from app.services.ai_service import (
    detect_issue_from_image,
    detect_issue_from_description,
    classify_severity_from_text,
)
from app.services.routing_service import route_to_department
from app.services.officer_service import get_officer_for_department


# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads/complaints"
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def create_complaint(db: Session, user, description: str, image: UploadFile = None, location_lat: float | None = None, location_lng: float | None = None):
    """
    Create a complaint with optional image, AI detection, mapped location, and auto-routing
    """
    try:
        issue_type = "UNKNOWN"

        # Save and process image if provided
        if image:
            # Save image to disk
            image_filename = f"{user.id}_{image.filename}"
            image_path = os.path.join(UPLOAD_DIR, image_filename)
            
            # Read and save file
            content = await image.read()
            with open(image_path, "wb") as f:
                f.write(content)

            # Use AI to detect issue from image
            try:
                issue_type = detect_issue_from_image(image_path)
            except Exception as e:
                print(f"Warning: AI detection failed - {e}")
                issue_type = "UNKNOWN"

        # If image detection did not return a useful issue, detect from text description
        if issue_type in ("UNKNOWN", "GENERAL"):
            try:
                issue_type = detect_issue_from_description(description)
            except Exception as e:
                print(f"Warning: description routing failed - {e}")
                issue_type = issue_type if issue_type != "UNKNOWN" else "GENERAL"

        # Classify severity from description text
        severity = classify_severity_from_text(description)

        # Create complaint record
        new_complaint = Complaint(
            description=description,
            issue_type=issue_type,
            severity=severity,
            status="PENDING",
            user_id=user.id,
            location_lat=location_lat,
            location_lng=location_lng,
        )

        db.add(new_complaint)
        db.commit()
        db.refresh(new_complaint)

        # Auto-route to appropriate department based on issue type
        department = route_to_department(db, issue_type)
        if department:
            new_complaint.department_id = department.id

            # Auto-assign complaint to department officer if one exists
            assigned_officer = get_officer_for_department(db, department.id)
            if assigned_officer:
                new_complaint.assigned_officer_id = assigned_officer.id
                new_complaint.status = "ASSIGNED"

            db.commit()
            db.refresh(new_complaint)

        # Create initial status history entries
        created_statuses = ["PENDING"]
        if new_complaint.status == "ASSIGNED":
            created_statuses.append("ASSIGNED")

        for status in created_statuses:
            history = StatusHistory(
                complaint_id=new_complaint.id,
                status=status,
                updated_by=user.id
            )
            db.add(history)
        db.commit()

        return new_complaint

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def get_all_complaints(db: Session):
    """Get all complaints for admin/officer view"""
    return db.query(Complaint).all()


def get_user_complaints(db: Session, user_id: int):
    """Get complaints for a specific user (citizen)"""
    return db.query(Complaint).filter(Complaint.user_id == user_id).all()


def update_status(db: Session, complaint_id: int, new_status: str, officer):

    # 1️⃣ Fetch complaint
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # 2️⃣ Update complaint status
    complaint.status = new_status

    # 3️⃣ Add status history record
    history = StatusHistory(
        complaint_id=complaint.id,
        status=new_status,
        updated_by=officer.id
    )

    db.add(history)
    db.commit()

    # 4️⃣ Refresh complaint object
    db.refresh(complaint)

    # 5️⃣ Trigger email notification to complaint owner
    notify_user(db, complaint.user, complaint)

    return complaint
