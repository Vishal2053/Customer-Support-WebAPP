"""
Utility functions and helpers
"""
import string
import random
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            hours=settings.jwt_expiration_hours
        )
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """Decode JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except jwt.InvalidTokenError:
        return None


def generate_unique_id(prefix: str = "", length: int = 12) -> str:
    """Generate unique ID"""
    characters = string.ascii_letters + string.digits
    random_part = ''.join(random.choice(characters) for _ in range(length))
    return f"{prefix}_{random_part}" if prefix else random_part


def generate_widget_id() -> str:
    """Generate unique widget ID"""
    return generate_unique_id(prefix="widget")


def generate_conversation_id() -> str:
    """Generate unique conversation ID"""
    return generate_unique_id(prefix="conv")
