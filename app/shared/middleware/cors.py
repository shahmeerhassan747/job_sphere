from fastapi.middleware.cors import CORSMiddleware
import os
from app.config.config import get_config  

def get_cors_middleware():
    """
    Configure CORS middleware based on environment and frontend requirements.
    Handles your frontend with proper credentials support.
    """
    config = get_config()  
    
    # Get environment from app settings
    # environment = settings.app_env.lower()
    
    # Base Azure Static Web App origins (your production frontend)
    production_origins = []
    
    # Development origins (all common localhost ports)
    development_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:4200",
        "http://localhost:8000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8080"
    ]
    
    allowed_origins = production_origins + development_origins
    
    # Add additional origins from environment variable if set
    additional_origins = os.getenv("CORS_ORIGINS", getattr(config, 'cors_origins', ''))
    if additional_origins:
        allowed_origins.extend([origin.strip() for origin in additional_origins.split(",") if origin.strip()])
    
    # Remove duplicates while preserving order
    allowed_origins = list(dict.fromkeys(allowed_origins))
    
    return {
        "middleware_class": CORSMiddleware,
        "options": {
            "allow_origins": allowed_origins,
            "allow_credentials": True,
            "allow_methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
            "allow_headers": [
                "Accept", "Accept-Language", "Content-Language", "Content-Type",
                "Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Methods",
                "Access-Control-Allow-Headers", "X-Requested-With", "X-CSRF-Token",
                "Cache-Control", "X-Forwarded-For", "X-Forwarded-Proto", "Origin", "Referer", "User-Agent"
            ],
            "expose_headers": ["Content-Type", "Authorization", "X-Total-Count", "X-Page-Count"],
            "max_age": 3600,
        }
    }
