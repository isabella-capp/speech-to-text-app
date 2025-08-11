from typing import Annotated
from fastapi import APIRouter, Depends, Request
from starlette import status
from fastapi.security import OAuth2PasswordRequestForm

from . import models
from .dependencies import register_user_service, login_for_access_token_service
from ..database.core import DbSession
from ..rate_limiting import limiter

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)


@router.post("/", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def register_user(
    request: Request,
    db: DbSession,
    register_user_request: models.RegisterUserRequest
):
    """Register a new user"""
    from .dependencies import get_auth_service
    auth_service = get_auth_service(db)
    user_dict = {
        'email': register_user_request.email,
        'first_name': register_user_request.first_name,
        'last_name': register_user_request.last_name,
        'password': register_user_request.password
    }
    return auth_service.register_user(user_dict)


@router.post("/token", response_model=models.Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DbSession
):
    """Login and get access token"""
    from .dependencies import get_auth_service
    auth_service = get_auth_service(db)
    token_data = auth_service.login(form_data.username, form_data.password)
    return models.Token(**token_data)







