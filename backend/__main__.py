"""
Application entry point - Run with: python main.py
"""
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
