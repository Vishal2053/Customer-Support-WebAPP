"""
API routes initialization
"""
from app.api.routes.auth import router as auth_router
from app.api.routes.knowledge_base import router as kb_router
from app.api.routes.chat import router as chat_router
from app.api.routes.widget import router as widget_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.admin import router as admin_router

__all__ = [
    "auth_router",
    "kb_router",
    "chat_router",
    "widget_router",
    "analytics_router",
    "admin_router",
]
