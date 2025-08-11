"""
Transcription routes - deprecated, use transcriptions.controller instead
"""
from fastapi import APIRouter

# Re-export the new controller
from ..transcriptions.controller import router

# Keep this file for backward compatibility
# Users should import from transcriptions.controller going forward
