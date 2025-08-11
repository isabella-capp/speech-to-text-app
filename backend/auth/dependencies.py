"""
Refactored authentication service using dependency injection and SOLID principles
"""
from typing import Annotated
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..core.container import get_container
from ..core.interfaces import IAuthService, IUserRepository
from ..database.core import get_db
from ..auth.models import RegisterUserRequest, Token, TokenData
from ..exceptions import AuthenticationError

# OAuth2 setup
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')

def get_auth_service(db: Session = Depends(get_db)) -> IAuthService:
    """Dependency injection for auth service"""
    container = get_container()
    user_repo = container.get(IUserRepository, db=db)
    return container.get(IAuthService, user_repo=user_repo)

def get_current_user(
    token: Annotated[str, Depends(oauth2_bearer)],
    auth_service: IAuthService = Depends(get_auth_service)
) -> TokenData:
    """Get current user from token"""
    return auth_service.get_current_user(token)

# Type alias for current user dependency
CurrentUser = Annotated[TokenData, Depends(get_current_user)]

def register_user_service(
    user_data: RegisterUserRequest,
    auth_service: IAuthService = Depends(get_auth_service)
) -> None:
    """Register a new user"""
    user_dict = {
        'email': user_data.email,
        'first_name': user_data.first_name,
        'last_name': user_data.last_name,
        'password': user_data.password
    }
    return auth_service.register_user(user_dict)

def login_for_access_token_service(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    auth_service: IAuthService = Depends(get_auth_service)
) -> Token:
    """Login and get access token"""
    token_data = auth_service.login(form_data.username, form_data.password)
    return Token(**token_data)
