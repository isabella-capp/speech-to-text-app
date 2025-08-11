"""
Improved logging configuration following SOLID principles
"""
import logging 
import os
from enum import StrEnum
from typing import Optional
from pathlib import Path

LOG_FORMAT_DEBUG = "%(levelname)s:%(message)s:%(pathname)s:%(funcName)s:%(lineno)d"

class LogLevels(StrEnum):
    debug = "DEBUG"
    info = "INFO"
    warning = "WARNING"
    error = "ERROR"


class LoggerFactory:
    """Factory for creating configured loggers following Single Responsibility Principle"""
    
    _configured = False
    
    @classmethod
    def configure_logging(cls, log_level: str = LogLevels.error, log_file: Optional[str] = None):
        """Configure logging for the application"""
        if cls._configured:
            return
            
        log_level = str(log_level).upper()
        log_levels = [level.value for level in LogLevels]

        if log_level not in log_levels:
            log_level = LogLevels.error

        # Create logs directory if it doesn't exist
        if log_file:
            log_path = Path(log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)
        
        handlers = [logging.StreamHandler()]  # Console output
        if log_file:
            handlers.append(logging.FileHandler(log_file))
        
        if log_level == LogLevels.debug:
            logging.basicConfig(level=log_level, format=LOG_FORMAT_DEBUG, handlers=handlers)
        else:
            logging.basicConfig(level=log_level, handlers=handlers)
            
        cls._configured = True
    
    @classmethod
    def get_logger(cls, name: str) -> logging.Logger:
        """Get a configured logger instance"""
        if not cls._configured:
            cls.configure_logging()
        return logging.getLogger(name)


class SecurityLogger:
    """Specialized logger for security events"""
    
    def __init__(self):
        self.logger = LoggerFactory.get_logger('security')
    
    def log_authentication_attempt(self, email: str, success: bool, ip_address: str = None):
        """Log authentication attempts"""
        status = "SUCCESS" if success else "FAILED"
        message = f"Authentication {status} for user: {email}"
        if ip_address:
            message += f" from IP: {ip_address}"
        
        if success:
            self.logger.info(message)
        else:
            self.logger.warning(message)


class AuditLogger:
    """Logger for audit trail events"""
    
    def __init__(self):
        self.logger = LoggerFactory.get_logger('audit')
    
    def log_transcription_created(self, user_id: str, transcription_id: int):
        """Log transcription creation"""
        self.logger.info(f"Transcription {transcription_id} created by user {user_id}")


# Legacy function for backward compatibility
def configure_logging(log_level: str = LogLevels.error):
    LoggerFactory.configure_logging(log_level)


# Global logger instances
security_logger = SecurityLogger()
audit_logger = AuditLogger()

# Configure logging on module import
LoggerFactory.configure_logging(
    log_level=os.getenv('LOG_LEVEL', LogLevels.info),
    log_file=os.getenv('LOG_FILE', 'logs/app.log')
)
