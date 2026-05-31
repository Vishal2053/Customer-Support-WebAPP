"""
API initialization
"""
from fastapi import APIRouter
from app.api.routes import (
    auth_router,
    kb_router,
    chat_router,
    widget_router,
    analytics_router,
)

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth_router)
api_router.include_router(kb_router)
api_router.include_router(chat_router)
api_router.include_router(widget_router)
api_router.include_router(analytics_router)

__all__ = ["api_router"]
