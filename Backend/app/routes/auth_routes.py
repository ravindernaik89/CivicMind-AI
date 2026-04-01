# app/routes/auth_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.department import Department
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse, PasswordResetRequest, PasswordReset
from app.services.auth_service import (
    register_user,
    authenticate_user,
    login_user,
    request_password_reset,
    reset_password,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# -----------------------------
# Register User
# -----------------------------
@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        new_user = register_user(db, user)
        return new_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# -----------------------------
# Login User
# -----------------------------
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = authenticate_user(db, user.email, user.password)

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = login_user(db_user)

    # Get role value
    role = db_user.role.value if hasattr(db_user.role, "value") else db_user.role

    # Build response
    response = {
        "access_token": token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": role
    }

    # Add department_id for officers
    if db_user.department_id:
        response["department_id"] = db_user.department_id

    return response


# -----------------------------
# Public departments list for officer login/selection
# -----------------------------
@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    """Get all departments without requiring authentication."""
    departments = db.query(Department).all()
    return departments


# -----------------------------
# Password Reset Request
# -----------------------------
@router.post("/password-reset-request")
def password_reset_request(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Request password reset - sends token to email (demo: returns token)"""
    try:
        result = request_password_reset(db, request.email)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# -----------------------------
# Reset Password
# -----------------------------
@router.post("/password-reset")
def password_reset(reset_data: PasswordReset, db: Session = Depends(get_db)):
    """Reset password using token"""
    try:
        result = reset_password(db, reset_data.token, reset_data.new_password)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
