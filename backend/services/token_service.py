"""
Token service implementation following Single Responsibility Principle
"""
from datetime import datetime, timezone, timedelta
from typing import Dict, Any
import jwt
from jwt import PyJWTError
from ..core.interfaces import ITokenService
from ..core.config import config
from ..exceptions import AuthenticationError
from ..app_logging import security_logger, LoggerFactory

logger = LoggerFactory.get_logger(__name__)


class JWTTokenService(ITokenService):
    """Service responsible only for JWT token operations"""
    
    def __init__(self):
        self._secret_key = config.jwt.secret_key
        self._algorithm = config.jwt.algorithm
        self._expire_minutes = config.jwt.access_token_expire_minutes
    
    def create_access_token(self, payload: Dict[str, Any]) -> str:
        """Create a JWT access token with the given payload"""
        # Add expiration time to payload
        expire = datetime.now(timezone.utc) + timedelta(minutes=self._expire_minutes)
        payload.update({"exp": expire})
        
        token = jwt.encode(payload, self._secret_key, algorithm=self._algorithm)
        logger.debug(f"Access token created for subject: {payload.get('sub')}")
        return token
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, self._secret_key, algorithms=[self._algorithm])
            return payload
        except PyJWTError as e:
            error_msg = f"Token verification failed: {str(e)}"
            security_logger.logger.warning(error_msg)
            logger.warning(error_msg)
            raise AuthenticationError("Invalid token")
