"""
User repository implementation following Repository pattern and Single Responsibility Principle
"""
from typing import Dict, Any, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from ..core.interfaces import IUserRepository, BaseRepository
from ..entities.users import User


class UserRepository(BaseRepository, IUserRepository):
    """Repository responsible only for user data access"""
    
    def __init__(self, db: Session):
        super().__init__(db)
    
    def _get_model_class(self):
        return User
    
    def create_user(self, user_data: Dict[str, Any]) -> User:
        """Create a new user"""
        user = User(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def update_user(self, user_id: UUID, user_data: Dict[str, Any]) -> bool:
        """Update user data"""
        result = self.db.query(User).filter(User.id == user_id).update(user_data)
        if result:
            self.db.commit()
            return True
        return False
    
    def delete_user(self, user_id: UUID) -> bool:
        """Delete user"""
        result = self.db.query(User).filter(User.id == user_id).delete()
        if result:
            self.db.commit()
            return True
        return False
