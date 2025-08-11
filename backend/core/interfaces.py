"""
Base interfaces and abstract classes following SOLID principles
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from uuid import UUID


class IPasswordService(ABC):
    """Interface for password hashing and verification"""
    
    @abstractmethod
    def hash_password(self, password: str) -> str:
        pass
    
    @abstractmethod
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        pass


class ITokenService(ABC):
    """Interface for token generation and verification"""
    
    @abstractmethod
    def create_access_token(self, payload: Dict[str, Any]) -> str:
        pass
    
    @abstractmethod
    def verify_token(self, token: str) -> Dict[str, Any]:
        pass


class IUserRepository(ABC):
    """Interface for user data access"""
    
    @abstractmethod
    def create_user(self, user_data: Dict[str, Any]) -> Any:
        pass
    
    @abstractmethod
    def get_user_by_email(self, email: str) -> Optional[Any]:
        pass
    
    @abstractmethod
    def get_user_by_id(self, user_id: UUID) -> Optional[Any]:
        pass
    
    @abstractmethod
    def update_user(self, user_id: UUID, user_data: Dict[str, Any]) -> bool:
        pass
    
    @abstractmethod
    def delete_user(self, user_id: UUID) -> bool:
        pass


class ITranscriptionRepository(ABC):
    """Interface for transcription data access"""
    
    @abstractmethod
    def create_transcription(self, transcription_data: Dict[str, Any]) -> Any:
        pass
    
    @abstractmethod
    def get_transcription_by_id(self, transcription_id: int) -> Optional[Any]:
        pass
    
    @abstractmethod
    def get_transcriptions_by_user(self, user_id: UUID) -> list[Any]:
        pass
    
    @abstractmethod
    def update_transcription(self, transcription_id: int, transcription_data: Dict[str, Any]) -> bool:
        pass
    
    @abstractmethod
    def delete_transcription(self, transcription_id: int) -> bool:
        pass


class IAuthService(ABC):
    """Interface for authentication service"""
    
    @abstractmethod
    def register_user(self, user_data: Dict[str, Any]) -> Any:
        pass
    
    @abstractmethod
    def authenticate_user(self, email: str, password: str) -> Optional[Any]:
        pass
    
    @abstractmethod
    def login(self, email: str, password: str) -> Dict[str, str]:
        pass
    
    @abstractmethod
    def get_current_user(self, token: str) -> Any:
        pass


class BaseRepository(ABC):
    """Base repository class with common database operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    @abstractmethod
    def _get_model_class(self):
        pass
