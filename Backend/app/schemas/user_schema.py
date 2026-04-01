# app/schemas/user_schema.py

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from app.models.user import UserRole


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    role: UserRole = UserRole.CITIZEN
    department_id: Optional[int] = None

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        # Only allow CITIZEN role for public registration
        if v != UserRole.CITIZEN:
            raise ValueError('Only Citizen role can be registered. Officers and Admins are created by administrators.')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    department_id: Optional[int] = None

    class Config:
        from_attributes = True


class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class OfficerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    department_id: int


# Password Reset Schemas
class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
