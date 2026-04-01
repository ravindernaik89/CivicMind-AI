# app/services/auth_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User, UserRole
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.email import send_password_reset_email
import secrets
import hashlib
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


# Get password hash (for admin use)
def get_password_hash(password: str):
    return hash_password(password)


# Register user
def register_user(db: Session, user_data):

    existing_user = db.query(User).filter(User.email == user_data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    password = user_data.password
    print(f"DEBUG register_user: email={user_data.email}, password={repr(password)}, len_chars={len(password)}, len_bytes={len(password.encode('utf-8'))}")

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(password),
        role=user_data.role,
        department_id=getattr(user_data, 'department_id', None)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# Authenticate user
def authenticate_user(db: Session, email: str, password: str):

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return user


# Login user
def login_user(user: User):

    # Build token payload with user info
    token_data = {
        "user_id": user.id,
        "role": user.role.value if hasattr(user.role, "value") else user.role
    }
    
    # Add department_id for officers
    if user.department_id:
        token_data["department_id"] = user.department_id

    token = create_access_token(token_data)

    return token


# Generate password reset token
def generate_password_reset_token(email: str) -> str:
    """Generate a secure token for password reset"""
    random_bytes = secrets.token_bytes(32)
    token_data = f"{email}:{random_bytes.hex()}"
    return hashlib.sha256(token_data.encode()).hexdigest()


# Request password reset
def request_password_reset(db: Session, email: str):
    """Process password reset request - generate token and send email"""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Don't reveal if email exists or not
        return {"message": "If an account exists with this email, a password reset link will be sent shortly."}
    
    # Only allow password reset for CITIZEN role
    role = user.role.value if hasattr(user.role, "value") else user.role
    if role != "CITIZEN":
        return {"message": "If an account exists with this email, a password reset link will be sent shortly."}
    
    # Generate reset token with timestamp
    token = generate_password_reset_token(email)
    
    # Get user's name
    user_name = user.name
    
    # Try to send the password reset email
    email_sent = send_password_reset_email(email, token, user_name)
    
    if email_sent:
        logger.info(f"Password reset email sent successfully to {email}")
        return {
            "message": "Password reset link has been sent to your email address. Please check your inbox (and spam folder).",
            "email": email
        }
    else:
        # Email sending failed, but still return success to avoid revealing system issues
        # Log for debugging
        logger.warning(f"Failed to send password reset email to {email}. Email may not be configured.")
        return {
            "message": "If an account exists with this email, a password reset link will be sent shortly. Please try again later if you don't receive it.",
            "email": email,
            "demo_mode": True,
            "note": "Email service is not configured. Please contact support."
        }


# Reset password with token
def reset_password(db: Session, token: str, new_password: str):
    """Reset password using the token"""
    # The token is a hash, so we need to find the user by checking
    # In a production system, you'd store the token in the database with expiry
    # For this implementation, we'll search through citizens and verify
    
    # Get all citizen users and check if any match the token
    citizens = db.query(User).filter(User.role == UserRole.CITIZEN).all()
    
    for user in citizens:
        expected_token = generate_password_reset_token(user.email)
        if expected_token == token:
            # Update password
            user.password_hash = hash_password(new_password)
            db.commit()
            return {"message": "Password reset successfully"}
    
    raise HTTPException(status_code=400, detail="Invalid or expired reset token")
