"""
CORS middleware
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def setup_cors(app: FastAPI):
    """Setup CORS middleware"""
    origins = []
    try:
        origins = settings.origins_list
    except Exception as e:
        logger.warning(f"Failed to load origins from settings: {e}")
        origins = []

    if not origins:
        logger.warning("No CORS origins configured; falling back to allow all origins")
        origins = ["*"]

    logger.info(f"Configuring CORS allow_origins={origins}")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=600,  # 10 minutes preflight cache
    )
