"""
Configuration management following dependency injection principles
"""
import os
from typing import Dict, Any
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class DatabaseConfig:
    """Database configuration"""
    url: str
    
    @classmethod
    def from_env(cls) -> 'DatabaseConfig':
        return cls(
            url=os.getenv("DATABASE_URL", "sqlite:///./app.db")
        )


@dataclass
class JWTConfig:
    """JWT configuration"""
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    
    @classmethod
    def from_env(cls) -> 'JWTConfig':
        return cls(
            secret_key=os.getenv('JWT_SECRET_KEY', 'default-secret'),
            algorithm=os.getenv('JWT_ALGORITHM', 'HS256'),
            access_token_expire_minutes=int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '30'))
        )


@dataclass
class AppConfig:
    """Application configuration"""
    database: DatabaseConfig
    jwt: JWTConfig
    
    @classmethod
    def from_env(cls) -> 'AppConfig':
        return cls(
            database=DatabaseConfig.from_env(),
            jwt=JWTConfig.from_env()
        )


# Global configuration instance
config = AppConfig.from_env()
