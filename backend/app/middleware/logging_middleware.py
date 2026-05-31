"""
Request logging middleware
"""
import logging
import time
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        try:
            response = await call_next(request)
        except Exception as exc:
            process_time = time.time() - start_time
            logger.exception(
                f"{request.method} {request.url.path} - "
                f"Unhandled error after {process_time:.3f}s: {type(exc).__name__}: {exc}"
            )
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"},
            )
        else:
            process_time = time.time() - start_time
            logger.info(
                f"{request.method} {request.url.path} - "
                f"Status: {response.status_code} - Duration: {process_time:.3f}s"
            )

            return response
