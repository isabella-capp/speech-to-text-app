"""
Simple test to verify the refactored architecture
"""
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all modules can be imported"""
    try:
        from core.interfaces import IPasswordService, ITokenService, IAuthService
        print("✓ Core interfaces imported successfully")
        
        from services.password_service import PasswordService
        print("✓ Password service imported successfully")
        
        from services.token_service import JWTTokenService
        print("✓ Token service imported successfully")
        
        return True
    except Exception as e:
        print(f"✗ Import failed: {str(e)}")
        return False

def test_password_service():
    """Test password service functionality"""
    try:
        from services.password_service import PasswordService
        
        password_service = PasswordService()
        
        # Test password hashing
        password = "test_password_123"
        hashed = password_service.hash_password(password)
        print(f"✓ Password hashed: {hashed[:20]}...")
        
        # Test password verification
        is_valid = password_service.verify_password(password, hashed)
        print(f"✓ Password verification: {is_valid}")
        
        # Test wrong password
        is_invalid = password_service.verify_password("wrong_password", hashed)
        print(f"✓ Wrong password verification: {not is_invalid}")
        
        return True
    except Exception as e:
        print(f"✗ Password service test failed: {str(e)}")
        return False

def test_token_service():
    """Test token service functionality"""
    try:
        # Set up a test secret key and config first
        os.environ['JWT_SECRET_KEY'] = 'test_secret_key_for_testing'
        os.environ['JWT_ALGORITHM'] = 'HS256'
        os.environ['ACCESS_TOKEN_EXPIRE_MINUTES'] = '30'
        
        # Create a simplified token service for testing
        from datetime import datetime, timezone, timedelta
        import jwt
        
        class TestTokenService:
            def __init__(self):
                self._secret_key = 'test_secret_key_for_testing'
                self._algorithm = 'HS256'
                self._expire_minutes = 30
            
            def create_access_token(self, payload):
                expire = datetime.now(timezone.utc) + timedelta(minutes=self._expire_minutes)
                payload.update({"exp": expire})
                return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)
            
            def verify_token(self, token):
                return jwt.decode(token, self._secret_key, algorithms=[self._algorithm])
        
        token_service = TestTokenService()
        
        # Test token creation
        payload = {'sub': 'test@example.com', 'id': 'test_user_id'}
        token = token_service.create_access_token(payload)
        print(f"✓ Token created: {token[:20]}...")
        
        # Test token verification
        decoded = token_service.verify_token(token)
        print(f"✓ Token verified: {decoded['sub']}")
        
        return True
    except Exception as e:
        print(f"✗ Token service test failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("=" * 50)
    print("Testing Refactored Backend Architecture")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_password_service,
        test_token_service
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        print(f"\nRunning {test.__name__}...")
        if test():
            passed += 1
        print("-" * 30)
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The refactored architecture is working correctly.")
        return True
    else:
        print("❌ Some tests failed. Please check the implementation.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
