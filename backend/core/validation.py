"""
Data validation and migration utilities following SOLID principles
"""
from typing import Dict, Any, List
from pydantic import BaseModel, EmailStr, validator
from uuid import UUID
import re


class UserValidationModel(BaseModel):
    """Validation model for user data"""
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        if not re.match(r'^[a-zA-Z\s]+$', v.strip()):
            raise ValueError('Name can only contain letters and spaces')
        return v.strip()
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v


class TranscriptionValidationModel(BaseModel):
    """Validation model for transcription data"""
    text: str
    language: str = None
    model_used: str = None
    
    @validator('text')
    def validate_text(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError('Transcription text cannot be empty')
        if len(v) > 10000:  # Reasonable limit
            raise ValueError('Transcription text too long (max 10000 characters)')
        return v.strip()
    
    @validator('language')
    def validate_language(cls, v):
        if v is not None:
            # Basic language code validation (ISO 639-1)
            if not re.match(r'^[a-z]{2}(-[A-Z]{2})?$', v):
                raise ValueError('Invalid language code format')
        return v


class DataMigrationService:
    """Service for handling data migrations and validations"""
    
    @staticmethod
    def validate_user_data(user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user data before creation"""
        try:
            validated = UserValidationModel(**user_data)
            return validated.dict()
        except Exception as e:
            raise ValueError(f"User data validation failed: {str(e)}")
    
    @staticmethod
    def validate_transcription_data(transcription_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate transcription data before creation"""
        try:
            validated = TranscriptionValidationModel(**transcription_data)
            return validated.dict()
        except Exception as e:
            raise ValueError(f"Transcription data validation failed: {str(e)}")
    
    @staticmethod
    def sanitize_user_output(user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize user data for safe output (remove sensitive fields)"""
        safe_data = user_data.copy()
        # Remove password hash from output
        safe_data.pop('password_hash', None)
        safe_data.pop('password', None)
        return safe_data
