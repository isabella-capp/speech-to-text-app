"""
Transcription service following Single Responsibility Principle
"""
from typing import Dict, Any, List, Optional
from uuid import UUID
from ..core.interfaces import ITranscriptionRepository
from ..app_logging import audit_logger, LoggerFactory

logger = LoggerFactory.get_logger(__name__)


class TranscriptionService:
    """Service responsible for transcription business logic"""
    
    def __init__(self, transcription_repository: ITranscriptionRepository):
        self._transcription_repository = transcription_repository
    
    def create_transcription(self, transcription_data: Dict[str, Any]) -> Any:
        """Create a new transcription"""
        try:
            transcription = self._transcription_repository.create_transcription(transcription_data)
            audit_logger.log_transcription_created(
                str(transcription_data.get('user_id')), 
                transcription.id
            )
            logger.info(f"Transcription {transcription.id} created successfully")
            return transcription
        except Exception as e:
            logger.error(f"Failed to create transcription. Error: {str(e)}")
            raise
    
    def get_transcription_by_id(self, transcription_id: int) -> Optional[Any]:
        """Get transcription by ID"""
        return self._transcription_repository.get_transcription_by_id(transcription_id)
    
    def get_user_transcriptions(self, user_id: UUID) -> List[Any]:
        """Get all transcriptions for a user"""
        return self._transcription_repository.get_transcriptions_by_user(user_id)
    
    def update_transcription(self, transcription_id: int, transcription_data: Dict[str, Any]) -> bool:
        """Update transcription"""
        try:
            result = self._transcription_repository.update_transcription(transcription_id, transcription_data)
            if result:
                logger.info(f"Transcription {transcription_id} updated successfully")
            return result
        except Exception as e:
            logger.error(f"Failed to update transcription {transcription_id}. Error: {str(e)}")
            raise
    
    def delete_transcription(self, transcription_id: int) -> bool:
        """Delete transcription"""
        try:
            result = self._transcription_repository.delete_transcription(transcription_id)
            if result:
                logger.info(f"Transcription {transcription_id} deleted successfully")
            return result
        except Exception as e:
            logger.error(f"Failed to delete transcription {transcription_id}. Error: {str(e)}")
            raise
