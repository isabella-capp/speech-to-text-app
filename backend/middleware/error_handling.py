"""
Global error handling middleware following Single Responsibility Principle
"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import traceback
from ..exceptions import BaseApplicationError
from ..app_logging import LoggerFactory

logger = LoggerFactory.get_logger(__name__)


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware for global error handling"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        try:
            response = await call_next(request)
            return response
        except BaseApplicationError as e:
            # Custom application errors - already properly formatted
            logger.warning(f"Application error: {e.detail} - Path: {request.url.path}")
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail}
            )
        except HTTPException as e:
            # FastAPI HTTP exceptions
            logger.warning(f"HTTP error: {e.detail} - Path: {request.url.path}")
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail}
            )
        except Exception as e:
            # Unexpected errors
            logger.error(f"Unexpected error: {str(e)} - Path: {request.url.path}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"}
            )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for request/response logging"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Log request
        logger.info(f"Request: {request.method} {request.url.path}")
        
        # Process request
        response = await call_next(request)
        
        # Log response
        logger.info(f"Response: {response.status_code} for {request.method} {request.url.path}")
        
        return response
