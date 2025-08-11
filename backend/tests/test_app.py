"""
Test configuration and utilities for the refactored backend
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock

from ..app import app
from ..database.core import Base, get_db
from ..core.container import get_container
from ..core.interfaces import IPasswordService, ITokenService


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override dependencies
app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)


@pytest.fixture
def test_db():
    """Fixture for test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def mock_password_service():
    """Mock password service for testing"""
    mock = Mock(spec=IPasswordService)
    mock.hash_password.return_value = "hashed_password"
    mock.verify_password.return_value = True
    return mock


@pytest.fixture
def mock_token_service():
    """Mock token service for testing"""
    mock = Mock(spec=ITokenService)
    mock.create_access_token.return_value = "test_token"
    mock.verify_token.return_value = {"id": "test_user_id", "sub": "test@example.com"}
    return mock


def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Speech-to-Text API is running"


def test_health_endpoint():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_container_setup():
    """Test that the DI container is properly configured"""
    container = get_container()
    
    # Test that we can get singleton services
    password_service = container.get(IPasswordService)
    token_service = container.get(ITokenService)
    
    assert password_service is not None
    assert token_service is not None
    
    # Test that singletons return the same instance
    password_service2 = container.get(IPasswordService)
    assert password_service is password_service2


if __name__ == "__main__":
    # Simple manual test
    test_root_endpoint()
    test_health_endpoint()
    test_container_setup()
    print("All basic tests passed!")
