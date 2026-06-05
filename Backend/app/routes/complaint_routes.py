# app/routes/complaint_routes.py
from fastapi import APIRouter, Depends, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.complaint_schema import ComplaintResponse
from app.services.complaint_service import (
    create_complaint,
    get_all_complaints,
    get_user_complaints,
    update_status,
)
from app.dependencies.auth_dependency import (
    get_current_user,
    require_role,
    require_roles,
)

router = APIRouter(prefix="/complaints", tags=["Complaints"])


# Citizen creates complaint with image
@router.post("/", response_model=ComplaintResponse)
async def create_new_complaint(
    description: str = Form(...),
    location_lat: float | None = Form(None),
    location_lng: float | None = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    user=Depends(require_role("CITIZEN")),
):
    return await create_complaint(db, user, description, image, location_lat, location_lng)


# Citizen views their own complaints
@router.get("/my", response_model=list[ComplaintResponse])
def get_my_complaints(
    db: Session = Depends(get_db),
    user=Depends(require_role("CITIZEN")),
):
    return get_user_complaints(db, user.id)


# Admin and Officer view all complaints - using require_roles
@router.get("/all", response_model=list[ComplaintResponse])
def get_all_complaints_route(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["ADMIN", "OFFICER"])),
):
    return get_all_complaints(db)


# Officer updates status
@router.put("/{complaint_id}/status")
def change_status(
    complaint_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    officer=Depends(require_role("OFFICER")),
):
    return update_status(db, complaint_id, new_status, officer)
