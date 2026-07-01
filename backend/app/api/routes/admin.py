"""
Admin API routes for user account management
"""
import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from supabase import Client
from app.db import get_service_db
from app.api.dependencies import get_current_admin

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])


# Pydantic validation schemas
class AdminUserCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    company_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str = "user"


class AdminUserUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class AdminUserResponse(BaseModel):
    id: str
    email: str
    company_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    created_at: datetime
    updated_at: datetime


@router.get("/users", response_model=List[AdminUserResponse])
async def list_users(
    db: Client = Depends(get_service_db),
    admin: dict = Depends(get_current_admin)
):
    """List all registered users"""
    try:
        response = db.table("users").select("*").order("created_at", desc=True).execute()
        # Fallback to check if role field is present on each user, default to user
        users = []
        for user in response.data:
            if "role" not in user or not user["role"]:
                user["role"] = "user"
            users.append(user)
        return users
    except Exception as e:
        logger.error(f"Admin list users error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )


@router.post("/users", response_model=AdminUserResponse)
async def create_user(
    user_data: AdminUserCreateRequest,
    db: Client = Depends(get_service_db),
    admin: dict = Depends(get_current_admin)
):
    """Create a new user account"""
    try:
        # Check if email is already in use
        existing = db.table("users").select("id").eq("email", user_data.email).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        # Create user in Supabase auth
        auth_response = db.auth.admin.create_user({
            "email": user_data.email,
            "password": user_data.password,
            "email_confirm": True,
            "user_metadata": {
                "company_name": user_data.company_name,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
            }
        })

        if not auth_response or not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create auth user in database"
            )

        # Insert user profile in public.users
        user_profile = {
            "id": auth_response.user.id,
            "email": user_data.email,
            "company_name": user_data.company_name,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "role": user_data.role,
        }

        profile_response = db.table("users").insert(user_profile).execute()
        return profile_response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin create user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )


@router.put("/users/{user_id}", response_model=AdminUserResponse)
async def update_user(
    user_id: str,
    user_data: AdminUserUpdateRequest,
    db: Client = Depends(get_service_db),
    admin: dict = Depends(get_current_admin)
):
    """Update user details"""
    try:
        # 1. Update Auth User if email or password is provided
        auth_updates = {}
        if user_data.email:
            auth_updates["email"] = user_data.email
        if user_data.password:
            auth_updates["password"] = user_data.password

        if auth_updates:
            db.auth.admin.update_user_by_id(user_id, auth_updates)

        # 2. Update Profile Table
        profile_updates = {}
        if user_data.company_name is not None:
            profile_updates["company_name"] = user_data.company_name
        if user_data.first_name is not None:
            profile_updates["first_name"] = user_data.first_name
        if user_data.last_name is not None:
            profile_updates["last_name"] = user_data.last_name
        if user_data.role is not None:
            profile_updates["role"] = user_data.role
        if user_data.email is not None:
            profile_updates["email"] = user_data.email

        if profile_updates:
            profile_updates["updated_at"] = datetime.utcnow().isoformat()
            response = db.table("users").update(profile_updates).eq("id", user_id).execute()
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User profile not found"
                )
            user_prof = response.data[0]
            if "role" not in user_prof or not user_prof["role"]:
                user_prof["role"] = "user"
            return user_prof

        # If no updates, just fetch current
        response = db.table("users").select("*").eq("id", user_id).execute()
        user_prof = response.data[0]
        if "role" not in user_prof or not user_prof["role"]:
            user_prof["role"] = "user"
        return user_prof

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin update user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: Client = Depends(get_service_db),
    admin: dict = Depends(get_current_admin)
):
    """Delete a user account"""
    try:
        # Delete user in Supabase auth (cascades to public.users profile due to FK on delete cascade)
        db.auth.admin.delete_user(user_id)
        return {"success": True, "message": "User deleted successfully"}
    except Exception as e:
        logger.error(f"Admin delete user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )
