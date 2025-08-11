"""
Authentication service implementation following Single Responsibility Principle
"""
from typing import Dict, Any, Optional
from uuid import UUID, uuid4
from ..core.interfaces import IAuthService, IUserRepository, IPasswordService, ITokenService
from ..auth.models import RegisterUserRequest, Token, TokenData
from ..exceptions import AuthenticationError
from ..app_logging import security_logger, LoggerFactory

logger = LoggerFactory.get_logger(__name__)


class AuthService(IAuthService):
    """Service responsible for authentication logic"""
    
    def __init__(
        self,
        user_repository: IUserRepository,
        password_service: IPasswordService,
        token_service: ITokenService
    ):
        self._user_repository = user_repository
        self._password_service = password_service
        self._token_service = token_service
    
    def register_user(self, user_data: Dict[str, Any]) -> Any:
        """Register a new user"""
        try:
            # Hash the password
            hashed_password = self._password_service.hash_password(user_data['password'])
            
            # Prepare user data
            user_creation_data = {
                'id': uuid4(),
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'password_hash': hashed_password
            }
            
            user = self._user_repository.create_user(user_creation_data)
            security_logger.log_registration_attempt(user_data['email'], True)
            logger.info(f"User registered successfully: {user_data['email']}")
            return user
        except Exception as e:
            security_logger.log_registration_attempt(user_data.get('email', 'unknown'), False)
            logger.error(f"Failed to register user: {user_data.get('email')}. Error: {str(e)}")
            raise
    
    def authenticate_user(self, email: str, password: str) -> Optional[Any]:
        """Authenticate a user with email and password"""
        user = self._user_repository.get_user_by_email(email)
        if not user:
            security_logger.log_authentication_attempt(email, False)
            logger.warning(f"Failed authentication attempt for email: {email} - user not found")
            return None
            
        if not self._password_service.verify_password(password, user.password_hash):
            security_logger.log_authentication_attempt(email, False)
            logger.warning(f"Failed authentication attempt for email: {email} - invalid password")
            return None
            
        security_logger.log_authentication_attempt(email, True)
        return user
    
    def login(self, email: str, password: str) -> Dict[str, str]:
        """Login user and return access token"""
        user = self.authenticate_user(email, password)
        if not user:
            raise AuthenticationError("Invalid credentials")
        
        # Create token payload
        payload = {
            'sub': user.email,
            'id': str(user.id)
        }
        
        access_token = self._token_service.create_access_token(payload)
        
        return {
            'access_token': access_token,
            'token_type': 'bearer'
        }
    
    def get_current_user(self, token: str) -> TokenData:
        """Get current user from token"""
        payload = self._token_service.verify_token(token)
        user_id = payload.get('id')
        return TokenData(user_id=user_id)
