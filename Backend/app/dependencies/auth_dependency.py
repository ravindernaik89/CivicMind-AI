# app/dependencies/auth_dependency.py

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    # Check if it's the admin mock token
    if token and token.endswith(".mock"):
        # Return a mock admin user object using a simple class
        class MockUser:
            def __init__(self):
                self.id = 0
                self.name = 'Admin'
                self.email = 'admin@civicmind.com'
                self.role = UserRole.ADMIN
                self.department_id = None
        return MockUser()
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("user_id")
        department_id = payload.get("department_id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Add department_id from token to user object if not set
    if department_id and not user.department_id:
        user.department_id = department_id

    return user


def require_role(required_role: str):
    def role_checker(user: User = Depends(get_current_user)):
        user_role = user.role.value if hasattr(user.role, "value") else user.role
        # Allow mock admin to access all routes
        if user_role == "ADMIN":
            return user
        if user_role != required_role:
            raise HTTPException(status_code=403, detail="Access forbidden")
        return user

    return role_checker


def require_roles(required_roles: list):
    """Allow multiple roles to access a route"""
    def role_checker(user: User = Depends(get_current_user)):
        user_role = user.role.value if hasattr(user.role, "value") else user.role
        # Allow mock admin to access all routes
        if user_role == "ADMIN":
            return user
        if user_role not in required_roles:
            raise HTTPException(status_code=403, detail="Access forbidden")
        return user

    return role_checker
