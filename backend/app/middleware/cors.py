"""
CORS middleware
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class DynamicWidgetCORSMiddleware:
    def __init__(self, app: FastAPI):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        method = scope.get("method", "")
        is_widget = "/api/v1/widget" in path

        if is_widget and method == "OPTIONS":
            origin = "*"
            for key, value in scope.get("headers", []):
                if key == b"origin":
                    origin = value.decode("utf-8")
                    break

            await send({
                "type": "http.response.start",
                "status": 200,
                "headers": [
                    (b"access-control-allow-origin", origin.encode("utf-8")),
                    (b"access-control-allow-methods", b"GET, POST, PUT, DELETE, OPTIONS, PATCH"),
                    (b"access-control-allow-headers", b"*"),
                    (b"access-control-max-age", b"600"),
                ],
            })
            await send({
                "type": "http.response.body",
                "body": b"",
            })
            return

        async def send_wrapper(message):
            if is_widget and message["type"] == "http.response.start":
                origin = "*"
                for key, value in scope.get("headers", []):
                    if key == b"origin":
                        origin = value.decode("utf-8")
                        break
                
                headers = list(message.get("headers", []))
                # Remove existing Access-Control headers
                headers = [h for h in headers if not h[0].lower().startswith(b"access-control-")]
                
                headers.extend([
                    (b"access-control-allow-origin", origin.encode("utf-8")),
                    (b"access-control-allow-methods", b"GET, POST, PUT, DELETE, OPTIONS, PATCH"),
                    (b"access-control-allow-headers", b"*"),
                ])
                message["headers"] = headers
            
            await send(message)

        await self.app(scope, receive, send_wrapper)


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

    # Dynamic CORS middleware for widget endpoints to support embeds on any website
    # Must be added LAST to execute FIRST (FastAPI/Starlette middleware order)
    app.add_middleware(DynamicWidgetCORSMiddleware)

