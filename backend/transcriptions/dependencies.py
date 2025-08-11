"""
Transcription dependencies using dependency injection
"""
from fastapi import Depends
from sqlalchemy.orm import Session

from ..core.container import get_container
from ..core.interfaces import ITranscriptionRepository
from ..database.core import get_db
from ..services.transcription_service import TranscriptionService


def get_transcription_service(db: Session = Depends(get_db)) -> TranscriptionService:
    """Dependency injection for transcription service"""
    container = get_container()
    transcription_repo = container.get(ITranscriptionRepository, db=db)
    return TranscriptionService(transcription_repo)
