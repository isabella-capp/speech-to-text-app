"""
Transcription repository implementation following Repository pattern and Single Responsibility Principle
"""
from typing import Dict, Any, Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from ..core.interfaces import ITranscriptionRepository, BaseRepository
from ..entities.transcriptions import Transcription


class TranscriptionRepository(BaseRepository, ITranscriptionRepository):
    """Repository responsible only for transcription data access"""
    
    def __init__(self, db: Session):
        super().__init__(db)
    
    def _get_model_class(self):
        return Transcription
    
    def create_transcription(self, transcription_data: Dict[str, Any]) -> Transcription:
        """Create a new transcription"""
        transcription = Transcription(**transcription_data)
        self.db.add(transcription)
        self.db.commit()
        self.db.refresh(transcription)
        return transcription
    
    def get_transcription_by_id(self, transcription_id: int) -> Optional[Transcription]:
        """Get transcription by ID"""
        return self.db.query(Transcription).filter(Transcription.id == transcription_id).first()
    
    def get_transcriptions_by_user(self, user_id: UUID) -> List[Transcription]:
        """Get all transcriptions for a user"""
        return self.db.query(Transcription).filter(Transcription.user_id == user_id).all()
    
    def update_transcription(self, transcription_id: int, transcription_data: Dict[str, Any]) -> bool:
        """Update transcription data"""
        result = self.db.query(Transcription).filter(Transcription.id == transcription_id).update(transcription_data)
        if result:
            self.db.commit()
            return True
        return False
    
    def delete_transcription(self, transcription_id: int) -> bool:
        """Delete transcription"""
        result = self.db.query(Transcription).filter(Transcription.id == transcription_id).delete()
        if result:
            self.db.commit()
            return True
        return False
