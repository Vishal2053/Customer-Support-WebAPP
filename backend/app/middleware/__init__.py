"""
Middleware module initialization
"""
from app.middleware.cors import setup_cors
from app.middleware.logging_middleware import LoggingMiddleware

__all__ = ["setup_cors", "LoggingMiddleware"]
