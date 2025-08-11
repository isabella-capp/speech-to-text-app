# Speech-to-Text Backend - Refactored Architecture

## Overview

This backend has been completely refactored following SOLID principles and clean architecture patterns. The new structure promotes maintainability, testability, and scalability.

## Architecture Overview

### SOLID Principles Implementation

1. **Single Responsibility Principle (SRP)**
   - Each service has a single, well-defined responsibility
   - Separate services for authentication, password handling, token management, etc.

2. **Open/Closed Principle (OCP)**
   - Interfaces define contracts that can be extended without modification
   - New authentication methods can be added by implementing existing interfaces

3. **Liskov Substitution Principle (LSP)**
   - All implementations can be substituted for their interfaces
   - Mock implementations can replace real ones in tests

4. **Interface Segregation Principle (ISP)**
   - Small, focused interfaces instead of large, monolithic ones
   - Services depend only on the interfaces they actually use

5. **Dependency Inversion Principle (DIP)**
   - High-level modules don't depend on low-level modules
   - Dependencies are injected through interfaces

### Project Structure

```
backend/
├── core/                   # Core architecture components
│   ├── interfaces.py      # Abstract interfaces
│   ├── config.py         # Configuration management
│   ├── container.py      # Dependency injection container
│   └── validation.py     # Data validation utilities
├── services/              # Business logic services
│   ├── auth_service.py   # Authentication business logic
│   ├── password_service.py # Password hashing/verification
│   ├── token_service.py  # JWT token management
│   └── transcription_service.py # Transcription business logic
├── repositories/          # Data access layer
│   ├── user_repository.py
│   └── transcription_repository.py
├── auth/                  # Authentication module
│   ├── controller.py     # Auth endpoints
│   ├── models.py         # Auth DTOs
│   └── dependencies.py   # Auth dependency injection
├── transcriptions/        # Transcription module
│   ├── controller.py     # Transcription endpoints
│   ├── models.py         # Transcription DTOs
│   └── dependencies.py   # Transcription dependency injection
├── middleware/            # Custom middleware
│   └── error_handling.py # Global error handling
├── entities/              # Database models
├── database/              # Database configuration
├── tests/                 # Test suite
└── app.py                # Main application
```

## Key Features

### Dependency Injection Container
- Centralized service registration and resolution
- Supports both singleton and transient lifecycles
- Easy to mock for testing

### Layered Architecture
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Repositories**: Handle data access
- **Entities**: Database models

### Error Handling
- Custom exception hierarchy
- Global error handling middleware
- Structured error responses

### Logging
- Structured logging with different loggers for different purposes
- Security audit logging
- Request/response logging

### Validation
- Input validation with Pydantic models
- Data sanitization utilities

## Configuration

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://user:password@localhost/dbname
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

## Running the Application

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
uvicorn app:app --reload
```

## Testing

Run tests with:
```bash
pytest tests/
```

## API Endpoints

### Authentication
- `POST /auth/` - Register new user
- `POST /auth/token` - Login and get access token

### Transcriptions
- `GET /transcriptions/` - Get user's transcriptions
- `POST /transcriptions/` - Create new transcription
- `GET /transcriptions/{id}` - Get specific transcription
- `PUT /transcriptions/{id}` - Update transcription
- `DELETE /transcriptions/{id}` - Delete transcription

## Benefits of the New Architecture

1. **Maintainability**: Clear separation of concerns makes code easier to understand and modify
2. **Testability**: Dependency injection makes unit testing straightforward
3. **Scalability**: Modular design allows for easy addition of new features
4. **Reliability**: Comprehensive error handling and logging
5. **Security**: Structured authentication and authorization
6. **Performance**: Optimized database queries and efficient service layer

## Migration from Old Code

The old `auth/service.py` has been replaced with:
- `services/auth_service.py` - Business logic
- `services/password_service.py` - Password operations
- `services/token_service.py` - Token operations
- `repositories/user_repository.py` - Data access
- `auth/dependencies.py` - Dependency injection

All functionality is preserved while following best practices.
