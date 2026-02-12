# backend/config.py
import os
from pathlib import Path

# Get the absolute base directory - ALWAYS absolute, never relative
BASE_DIR = Path(__file__).resolve().parent

class Config:
    """Base configuration with absolute paths"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # Database settings - Use absolute path
    # If DATABASE_URL is set in .env, use it; otherwise use default absolute path
    _db_url = os.getenv('DATABASE_URL')
    if _db_url and not _db_url.startswith(('sqlite:///', 'postgresql://', 'mysql://')):
        # If it's a relative path, make it absolute
        SQLALCHEMY_DATABASE_URI = f'sqlite:///{BASE_DIR / _db_url}'
    elif _db_url:
        SQLALCHEMY_DATABASE_URI = _db_url
    else:
        # Default: absolute path
        SQLALCHEMY_DATABASE_URI = f'sqlite:///{BASE_DIR / "data" / "inventory.db"}'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    # YOLO Model settings - Use absolute path
    _model_path = os.getenv('MODEL_PATH')
    if _model_path and not Path(_model_path).is_absolute():
        # If relative path, make it absolute
        MODEL_PATH = str(BASE_DIR / _model_path)
    elif _model_path:
        MODEL_PATH = _model_path
    else:
        # Default: absolute path
        MODEL_PATH = str(BASE_DIR / 'models' / 'best.pt')
    
    DETECTION_CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', '0.1'))
    
    # CORS settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
    
    # File upload settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    
    @staticmethod
    def init_app(app):
        """Initialize application with this config"""
        # Ensure data directory exists
        data_dir = BASE_DIR / 'data'
        data_dir.mkdir(exist_ok=True)
        
        # Log configuration for debugging
        print(f"Base Directory: {BASE_DIR}")
        print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print(f"Model Path: {app.config['MODEL_PATH']}")


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = False  # Set to True to debug SQL


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_ECHO = False
    
    @staticmethod
    def init_app(app):
        Config.init_app(app)
        # Add production-specific initialization here


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}