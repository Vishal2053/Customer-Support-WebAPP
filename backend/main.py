"""
FastAPI application factory
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.middleware.cors import setup_cors
from app.middleware.logging_middleware import LoggingMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Customer Support API",
    description="FastAPI backend for AI-powered customer support",
    version="0.1.0"
)

# Add logging middleware FIRST (will execute last in the chain)
app.add_middleware(LoggingMiddleware)

# Add CORS middleware LAST (will execute first in the chain)
setup_cors(app)

# Include routers
app.include_router(api_router, prefix="/api/v1")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "API is running"}

# CORS test endpoint
@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    """Handle CORS preflight requests"""
    return {"message": "OK"}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Customer Support API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    from app.core.config import settings
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
