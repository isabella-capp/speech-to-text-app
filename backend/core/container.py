"""
Dependency injection container following Dependency Inversion Principle
"""
from typing import Dict, Type, Any, Callable
from functools import lru_cache
from sqlalchemy.orm import Session

from ..core.interfaces import (
    IPasswordService, ITokenService, IAuthService, 
    IUserRepository, ITranscriptionRepository
)
from ..services.password_service import PasswordService
from ..services.token_service import JWTTokenService
from ..services.auth_service import AuthService
from ..repositories.user_repository import UserRepository
from ..repositories.transcription_repository import TranscriptionRepository


class DIContainer:
    """Dependency injection container"""
    
    def __init__(self):
        self._services: Dict[Type, Callable] = {}
        self._singletons: Dict[Type, Any] = {}
        self._register_services()
    
    def _register_services(self):
        """Register all services and their dependencies"""
        
        # Register services as singletons
        self.register_singleton(IPasswordService, lambda: PasswordService())
        self.register_singleton(ITokenService, lambda: JWTTokenService())
        
        # Register services with dependencies
        self.register_transient(IUserRepository, lambda db: UserRepository(db))
        self.register_transient(ITranscriptionRepository, lambda db: TranscriptionRepository(db))
        
        # Register auth service with all its dependencies
        self.register_transient(
            IAuthService, 
            lambda user_repo, password_service, token_service: AuthService(
                user_repo, password_service, token_service
            )
        )
    
    def register_singleton(self, interface: Type, factory: Callable):
        """Register a singleton service"""
        self._services[interface] = factory
        
    def register_transient(self, interface: Type, factory: Callable):
        """Register a transient service"""
        self._services[interface] = factory
    
    def get(self, interface: Type, **kwargs) -> Any:
        """Get service instance"""
        if interface in self._singletons:
            return self._singletons[interface]
            
        if interface not in self._services:
            raise ValueError(f"Service {interface} not registered")
        
        factory = self._services[interface]
        
        # Handle different factory signatures
        import inspect
        sig = inspect.signature(factory)
        
        if len(sig.parameters) == 0:
            # No parameters - singleton
            instance = factory()
            self._singletons[interface] = instance
            return instance
        
        elif len(sig.parameters) == 1:
            # Single parameter - likely database session
            param_name = list(sig.parameters.keys())[0]
            if param_name == 'db' and 'db' in kwargs:
                return factory(kwargs['db'])
        
        elif len(sig.parameters) == 3:
            # Multiple parameters - inject dependencies
            if interface == IAuthService:
                user_repo = kwargs.get('user_repo')
                password_service = self.get(IPasswordService)
                token_service = self.get(ITokenService)
                return factory(user_repo, password_service, token_service)
        
        raise ValueError(f"Cannot resolve dependencies for {interface}")


# Global container instance
@lru_cache()
def get_container() -> DIContainer:
    return DIContainer()
