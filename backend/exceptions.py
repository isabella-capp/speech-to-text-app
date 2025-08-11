"""
Custom exceptions following Open/Closed Principle for easy extension
"""
from fastapi import HTTPException
from typing import Dict, Any, Optional


class BaseApplicationError(HTTPException):
    """Base exception for all application errors"""
    
    def __init__(self, status_code: int, detail: str, headers: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class ValidationError(BaseApplicationError):
    """Exception for validation errors"""
    
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(status_code=400, detail=detail)


class AuthenticationError(BaseApplicationError):
    """Exception for authentication errors"""
    
    def __init__(self, detail: str = "Could not validate user"):
        super().__init__(status_code=401, detail=detail)


class AuthorizationError(BaseApplicationError):
    """Exception for authorization errors"""
    
    def __init__(self, detail: str = "Access denied"):
        super().__init__(status_code=403, detail=detail)


class NotFoundError(BaseApplicationError):
    """Exception for resource not found errors"""
    
    def __init__(self, resource: str = "Resource"):
        super().__init__(status_code=404, detail=f"{resource} not found")


class ConflictError(BaseApplicationError):
    """Exception for conflict errors"""
    
    def __init__(self, detail: str = "Resource conflict"):
        super().__init__(status_code=409, detail=detail)


class InternalServerError(BaseApplicationError):
    """Exception for internal server errors"""
    
    def __init__(self, detail: str = "Internal server error"):
        super().__init__(status_code=500, detail=detail)


# User-specific exceptions
class UserError(BaseApplicationError):
    """Base exception for user-related errors"""
    pass


class UserNotFoundError(UserError):
    def __init__(self, user_id=None):
        message = "User not found" if user_id is None else f"User with id {user_id} not found"
        super().__init__(status_code=404, detail=message)


class UserAlreadyExistsError(UserError):
    def __init__(self, email: str):
        super().__init__(status_code=409, detail=f"User with email {email} already exists")


class PasswordMismatchError(UserError):
    def __init__(self):
        super().__init__(status_code=400, detail="New passwords do not match")


class InvalidPasswordError(UserError):
    def __init__(self):
        super().__init__(status_code=401, detail="Current password is incorrect")


# Transcription-specific exceptions
class TranscriptionError(BaseApplicationError):
    """Base exception for transcription-related errors"""
    pass


class TranscriptionNotFoundError(TranscriptionError):
    def __init__(self, transcription_id: int):
        super().__init__(status_code=404, detail=f"Transcription with id {transcription_id} not found")


class TranscriptionAccessDeniedError(TranscriptionError):
    def __init__(self):
        super().__init__(status_code=403, detail="Access denied to this transcription")


class TranscriptionProcessingError(TranscriptionError):
    def __init__(self, detail: str = "Error processing transcription"):
        super().__init__(status_code=500, detail=detail)
