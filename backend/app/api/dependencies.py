"""
Authentication and authorization dependencies for FastAPI endpoints
"""
import logging
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.db import get_db, get_service_db

logger = logging.getLogger(__name__)
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Client = Depends(get_db),
    service_db: Client = Depends(get_service_db)
) -> dict:
    """
    Dependency to validate session token against Supabase Auth
    and return the corresponding user database profile.
    """
    token = credentials.credentials
    try:
        # Verify token with Supabase Auth
        auth_response = db.auth.get_user(token)
        if not auth_response or not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token"
            )
        
        user_id = auth_response.user.id
        # Get user profile from public.users
        profile_response = service_db.table("users").select("*").eq("id", user_id).execute()
        if not profile_response.data:
            # Fallback in case profile table doesn't have it but auth exists
            metadata = auth_response.user.user_metadata or {}
            return {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "company_name": metadata.get("company_name", ""),
                "first_name": metadata.get("first_name"),
                "last_name": metadata.get("last_name"),
                "role": "user" # default
            }
            
        return profile_response.data[0]
    except Exception as e:
        logger.error(f"Authentication dependency error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

async def get_current_admin(user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency to verify if the authenticated user has admin privileges.
    """
    role = user.get("role")
    email = user.get("email")
    
    # Check if user is explicit admin or is the master user datascientistvishu@gmail.com
    if role != "admin" and email != "datascientistvishu@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user
