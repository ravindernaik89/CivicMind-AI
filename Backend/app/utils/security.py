# app/utils/security.py

from passlib.hash import pbkdf2_sha256
from datetime import datetime, timedelta
from jose import jwt
from app.config import settings


# Hash password
def hash_password(password: str):
    password = str(password)
    # pbkdf2_sha256 does not have bcrypt 72-byte limit and supports longer values safely
    return pbkdf2_sha256.hash(password)


# Verify password
def verify_password(plain_password: str, hashed_password: str):
    plain_password = str(plain_password)
    return pbkdf2_sha256.verify(plain_password, hashed_password)


# Create JWT token
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token
