"""
Transcription models for request/response DTOs
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TranscriptionRequest(BaseModel):
    """Request model for creating transcriptions"""
    text: str
    language: Optional[str] = None
    model_used: Optional[str] = None


class TranscriptionResponse(BaseModel):
    """Response model for transcription data"""
    id: int
    user_id: str
    text: str
    language: Optional[str]
    model_used: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class TranscriptionUpdateRequest(BaseModel):
    """Request model for updating transcriptions"""
    text: Optional[str] = None
    language: Optional[str] = None
    model_used: Optional[str] = None
