"""
Database connection and setup
"""
import logging
import inspect
from typing import Optional
import httpx
from supabase import create_client, Client, ClientOptions
from app.core.config import settings

logger = logging.getLogger(__name__)


class SupabaseDB:
    """Supabase database manager"""
    
    _instance: Optional[Client] = None
    _service_instance: Optional[Client] = None

    @staticmethod
    def _client_options() -> ClientOptions:
        options = {}
        if "httpx_client" in inspect.signature(ClientOptions).parameters:
            options["httpx_client"] = httpx.Client(trust_env=False)
        return ClientOptions(**options)
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client"""
        if cls._instance is None:
            try:
                cls._instance = create_client(
                    settings.supabase_url,
                    settings.supabase_key,
                    options=cls._client_options(),
                )
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                raise
        return cls._instance
    
    @classmethod
    def get_service_client(cls) -> Client:
        """Get Supabase client with service role key (admin operations)"""
        if cls._service_instance is None:
            try:
                cls._service_instance = create_client(
                    settings.supabase_url,
                    settings.supabase_service_role_key,
                    options=cls._client_options(),
                )
                logger.info("Supabase service client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize service client: {e}")
                raise
        return cls._service_instance
    
    @classmethod
    def disconnect(cls):
        """Close database connection"""
        cls._instance = None
        cls._service_instance = None


def get_db() -> Client:
    """Dependency for getting database client"""
    return SupabaseDB.get_client()


def get_service_db() -> Client:
    """Dependency for getting a service-role database client"""
    return SupabaseDB.get_service_client()
