"""
Authentication service
"""
import logging
from typing import Optional
from postgrest.exceptions import APIError
from gotrue.errors import AuthApiError
from supabase import Client
from app.schemas import UserSignupRequest, UserLoginRequest
from app.db import get_db

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication service"""
    
    def __init__(self, db: Client, service_db: Optional[Client] = None):
        self.db = db
        self.service_db = service_db or db

    @staticmethod
    def _is_missing_users_table(error: Exception) -> bool:
        if isinstance(error, APIError):
            return "PGRST205" in str(error) and "public.users" in str(error)
        return False

    @staticmethod
    def _auth_user_profile(user) -> dict:
        metadata = user.user_metadata or {}
        return {
            "id": user.id,
            "email": user.email,
            "company_name": metadata.get("company_name", ""),
            "first_name": metadata.get("first_name"),
            "last_name": metadata.get("last_name"),
        }
    
    async def signup(self, user_data: UserSignupRequest) -> dict:
        """Register new user"""
        try:
            logger.info(f"Starting signup for {user_data.email}")
            
            # Check if user already exists
            profile_table_available = True
            try:
                response = self.service_db.table("users").select("id").eq(
                    "email", user_data.email
                ).execute()

                if response.data:
                    raise ValueError("User with this email already exists")
            except Exception as e:
                if not self._is_missing_users_table(e):
                    raise
                profile_table_available = False
                logger.warning("public.users table is missing; signup will use auth metadata only")
            
            # Create user in auth
            logger.info(f"Creating auth user for {user_data.email}")
            auth_response = self.service_db.auth.admin.create_user({
                "email": user_data.email,
                "password": user_data.password,
                "email_confirm": True,
                "user_metadata": {
                    "company_name": user_data.company_name,
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name,
                },
            })
            
            if auth_response.user is None:
                raise ValueError("Failed to create auth user")
            
            logger.info(f"Auth user created with ID: {auth_response.user.id}")
            
            # Create user profile in database
            user_profile = {
                "id": auth_response.user.id,
                "email": user_data.email,
                "company_name": user_data.company_name,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
            }
            
            if profile_table_available:
                logger.info(f"Inserting user profile into database")
                self.service_db.table("users").insert(user_profile).execute()
            
            logger.info(f"User {user_data.email} registered successfully")
            return {"message": "Signup successful", "user_id": auth_response.user.id}
        except Exception as e:
            error_text = str(e).lower()
            if "already" in error_text or "registered" in error_text:
                raise ValueError("User with this email already exists") from e
            logger.error(f"Signup error: {type(e).__name__}: {e}", exc_info=True)
            raise
    
    async def login(self, user_data: UserLoginRequest) -> dict:
        """Login user"""
        try:
            response = self.db.auth.sign_in_with_password({
                "email": user_data.email,
                "password": user_data.password,
            })
            
            if response.user is None:
                raise ValueError("Invalid credentials")
            
            # Get user profile
            try:
                profile = self.service_db.table("users").select("*").eq(
                    "id", response.user.id
                ).execute()
                user = profile.data[0] if profile.data else self._auth_user_profile(response.user)
            except Exception as e:
                if not self._is_missing_users_table(e):
                    raise
                logger.warning("public.users table is missing; login will use auth metadata only")
                user = self._auth_user_profile(response.user)
            
            logger.info(f"User {user_data.email} logged in successfully")
            return {
                "access_token": response.session.access_token,
                "user": user,
            }
            
        except AuthApiError as e:
            logger.warning(f"Login authentication error for {user_data.email}: {e}")
            raise ValueError("Invalid credentials") from e
        except Exception as e:
            logger.error(f"Login error: {e}")
            raise
    
    async def get_user(self, user_id: str) -> Optional[dict]:
        """Get user by ID"""
        try:
            response = self.service_db.table("users").select("*").eq(
                "id", user_id
            ).execute()
            
            return response.data[0] if response.data else None
            
        except Exception as e:
            logger.error(f"Get user error: {e}")
            raise


def get_auth_service() -> AuthService:
    """Dependency for authentication service"""
    from app.db import get_service_db

    db = get_db()
    service_db = get_service_db()
    return AuthService(db, service_db)
