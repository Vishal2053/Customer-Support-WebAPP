"""
Application configuration settings
"""
import os
from typing import Any, List
from pydantic import field_validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Force reload from .env to override any stale environment variables during uvicorn reload
load_dotenv(override=True)



class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # App Configuration
    app_name: str = "AI Customer Support"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value: Any) -> bool:
        """Accept common environment names if DEBUG is set globally."""
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production", "prod", "false", "0", "no", "off", "warn", "warning", "error", "critical"}:
                return False
            if normalized in {"debug", "development", "dev", "true", "1", "yes", "on", "info", "trace"}:
                return True
        return value
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_prefix: str = "/api/v1"
    public_api_base_url: str = "http://localhost:8000"
    
    # CORS Configuration
    allowed_origins: str = "http://localhost:3000,http://localhost:5173,https://customer-support-web-app-akd8-teal.vercel.app"
    
    @property
    def origins_list(self) -> List[str]:
        return [
            origin.strip().strip('"').strip("'").rstrip('/')
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        ]
    
    # Supabase Configuration
    supabase_url: str
    supabase_key: str
    supabase_service_role_key: str
    
    # JWT Configuration
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # AI/LLM Configuration (Groq)
    groq_api_key: str
    groq_model: str = "mixtral-8x7b-32768"
    
    # Scraping Configuration
    serper_api_key: str = ""
    
    # Storage Configuration
    storage_bucket: str = "documents"
    max_file_size: int = 10485760  # 10MB
    
    # Vector Database
    vector_db_type: str = "supabase_pgvector"
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "logs/app.log"
    
    # Database
    database_url: str = ""
    
# Pydantic v2 configuration: allow extra env vars (ignore unknown keys)
    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore",
    }


settings = Settings()
