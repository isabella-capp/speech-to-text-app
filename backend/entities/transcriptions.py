from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database.core import Base


class Transcription(Base):
    __tablename__ = "transcriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(PostgresUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    language = Column(String, nullable=True)
    model_used = Column(String, nullable=True)
    text = Column(Text, nullable=False)

    # Relazione Many-to-One con User (una trascrizione appartiene a un utente)
    user = relationship("User", back_populates="transcriptions")