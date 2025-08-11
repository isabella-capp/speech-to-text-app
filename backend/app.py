"""
Main FastAPI application following SOLID principles and clean architecture
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth.controller import router as auth_router
from .transcriptions.controller import router as transcriptions_router
from .database.core import Base, engine
from .middleware.error_handling import ErrorHandlingMiddleware, RequestLoggingMiddleware
from .app_logging import LoggerFactory

# Configure logging
logger = LoggerFactory.get_logger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Speech-to-Text API",
    description="A clean architecture speech-to-text application following SOLID principles",
    version="2.0.0"
)

# Add middleware (order matters - first added is outermost)
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(RequestLoggingMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(transcriptions_router)

@app.get("/")
async def root():
    """Health check endpoint"""
    logger.info("Root endpoint accessed")
    return {"message": "Speech-to-Text API is running", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("Speech-to-Text API starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("Speech-to-Text API shutting down...")
