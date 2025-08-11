"""
Transcription controller following REST principles and SOLID design
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .models import TranscriptionRequest, TranscriptionResponse, TranscriptionUpdateRequest
from .dependencies import get_transcription_service
from ..services.transcription_service import TranscriptionService
from ..auth.dependencies import CurrentUser
from ..database.core import DbSession

router = APIRouter(
    prefix='/transcriptions',
    tags=['transcriptions']
)


@router.post("/", response_model=TranscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_transcription(
    transcription_request: TranscriptionRequest,
    current_user: CurrentUser,
    transcription_service: TranscriptionService = Depends(get_transcription_service)
):
    """Create a new transcription"""
    user_id = current_user.get_uuid()
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")
    
    transcription_data = {
        'user_id': user_id,
        'text': transcription_request.text,
        'language': transcription_request.language,
        'model_used': transcription_request.model_used
    }
    
    transcription = transcription_service.create_transcription(transcription_data)
    return TranscriptionResponse.from_orm(transcription)


@router.get("/", response_model=List[TranscriptionResponse])
async def get_user_transcriptions(
    current_user: CurrentUser,
    transcription_service: TranscriptionService = Depends(get_transcription_service)
):
    """Get all transcriptions for the current user"""
    user_id = current_user.get_uuid()
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")
    
    transcriptions = transcription_service.get_user_transcriptions(user_id)
    return [TranscriptionResponse.from_orm(t) for t in transcriptions]


@router.get("/{transcription_id}", response_model=TranscriptionResponse)
async def get_transcription(
    transcription_id: int,
    current_user: CurrentUser,
    transcription_service: TranscriptionService = Depends(get_transcription_service)
):
    """Get a specific transcription by ID"""
    transcription = transcription_service.get_transcription_by_id(transcription_id)
    
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    # Check if the transcription belongs to the current user
    if str(transcription.user_id) != current_user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return TranscriptionResponse.from_orm(transcription)


@router.put("/{transcription_id}", response_model=TranscriptionResponse)
async def update_transcription(
    transcription_id: int,
    update_request: TranscriptionUpdateRequest,
    current_user: CurrentUser,
    transcription_service: TranscriptionService = Depends(get_transcription_service)
):
    """Update a transcription"""
    # First, check if transcription exists and belongs to user
    transcription = transcription_service.get_transcription_by_id(transcription_id)
    
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    if str(transcription.user_id) != current_user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Prepare update data (only include non-None values)
    update_data = {}
    if update_request.text is not None:
        update_data['text'] = update_request.text
    if update_request.language is not None:
        update_data['language'] = update_request.language
    if update_request.model_used is not None:
        update_data['model_used'] = update_request.model_used
    
    success = transcription_service.update_transcription(transcription_id, update_data)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update transcription")
    
    # Return updated transcription
    updated_transcription = transcription_service.get_transcription_by_id(transcription_id)
    return TranscriptionResponse.from_orm(updated_transcription)


@router.delete("/{transcription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transcription(
    transcription_id: int,
    current_user: CurrentUser,
    transcription_service: TranscriptionService = Depends(get_transcription_service)
):
    """Delete a transcription"""
    # First, check if transcription exists and belongs to user
    transcription = transcription_service.get_transcription_by_id(transcription_id)
    
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    if str(transcription.user_id) != current_user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    success = transcription_service.delete_transcription(transcription_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete transcription")
