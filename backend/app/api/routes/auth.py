"""
Authentication routes
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from app.schemas import UserSignupRequest, UserLoginRequest, UserResponse
from app.services import get_auth_service, AuthService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])


@router.get("/debug")
async def debug():
    """Debug endpoint to test database connection"""
    try:
        from app.db import get_db
        db = get_db()
        # Try to execute a simple query
        result = db.table("users").select("count").execute()
        return {
            "status": "ok",
            "message": "Database connection successful",
            "data": result.data if hasattr(result, 'data') else "No data returned"
        }
    except Exception as e:
        logger.error(f"Debug endpoint error: {type(e).__name__}: {e}", exc_info=True)
        return {
            "status": "error",
            "message": f"Database connection failed: {type(e).__name__}",
            "error": str(e)
        }


@router.post("/signup")
async def signup(
    user_data: UserSignupRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Register new user"""
    try:
        result = await auth_service.signup(user_data)
        return result
    except ValueError as e:
        logger.warning(f"Signup validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Signup error: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Signup failed: {type(e).__name__} - {str(e)}"
        )


@router.post("/login")
async def login(
    user_data: UserLoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Login user"""
    try:
        result = await auth_service.login(user_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/logout")
async def logout():
    """Logout user"""
    return {"message": "Logout successful"}


@router.get("/me")
async def get_current_user():
    """Get current user"""
    return {"message": "Protected route"}
