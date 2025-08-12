# backend/app/routers/auth.py
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
import jwt
from datetime import datetime, timedelta
import hashlib
import os

router = APIRouter()
security = HTTPBearer()

# Modelli per le richieste
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    token_type: str = "bearer"

# Simulazione database utenti (in produzione usare un vero database)
USERS_DB = {
    "admin@speechgpt.com": {
        "id": "1",
        "name": "Admin User",
        "email": "admin@speechgpt.com",
        "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
        "created_at": datetime.now()
    },
    "user@speechgpt.com": {
        "id": "2",
        "name": "Regular User",
        "email": "user@speechgpt.com",
        "password_hash": hashlib.sha256("user123".encode()).hexdigest(),
        "created_at": datetime.now()
    },
    "demo@example.com": {
        "id": "3",
        "name": "Demo User",
        "email": "demo@example.com",
        "password_hash": hashlib.sha256("demo123".encode()).hexdigest(),
        "created_at": datetime.now()
    }
}

# Chiave segreta per JWT (in produzione usare una variabile d'ambiente)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(email: str = Depends(verify_token)):
    user = USERS_DB.get(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    user = USERS_DB.get(request.email)
    
    if not user or user["password_hash"] != hash_password(request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    user_response = UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"]
    )
    
    return AuthResponse(user=user_response, token=access_token)

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    # Controlla se l'utente esiste già
    if request.email in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Crea nuovo utente
    new_user = {
        "id": str(len(USERS_DB) + 1),
        "name": request.name,
        "email": request.email,
        "password_hash": hash_password(request.password),
        "created_at": datetime.now()
    }
    
    USERS_DB[request.email] = new_user
    
    # Crea token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user["email"]}, expires_delta=access_token_expires
    )
    
    user_response = UserResponse(
        id=new_user["id"],
        name=new_user["name"],
        email=new_user["email"],
        created_at=new_user["created_at"]
    )
    
    return AuthResponse(user=user_response, token=access_token)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )

@router.post("/logout")
async def logout():
    # In una implementazione reale, qui aggiungeresti il token a una blacklist
    return {"message": "Successfully logged out"}

@router.post("/social/google")
async def google_login():
    # Placeholder per login Google
    # In una implementazione reale, qui gestiresti OAuth con Google
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google login not implemented yet"
    )

@router.post("/social/github")
async def github_login():
    # Placeholder per login GitHub
    # In una implementazione reale, qui gestiresti OAuth con GitHub
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GitHub login not implemented yet"
    )
