"""
Password service implementation following Single Responsibility Principle
"""
from passlib.context import CryptContext
from ..core.interfaces import IPasswordService


class PasswordService(IPasswordService):
    """Service responsible only for password hashing and verification"""
    
    def __init__(self):
        self._bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
    
    def hash_password(self, password: str) -> str:
        """Hash a plain text password"""
        return self._bcrypt_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a plain text password against a hash"""
        return self._bcrypt_context.verify(plain_password, hashed_password)
