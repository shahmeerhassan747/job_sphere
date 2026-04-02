import logging
import os
from pydantic_settings import BaseSettings
from pydantic import SecretStr, field_validator, model_validator
from sqlalchemy.engine import URL
from typing import Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


class AppConfig(BaseSettings):
    # Database - individual fields (optional if DATABASE_URL is provided)
    DB_ENGINE: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[SecretStr] = None
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[int] = None
    DB_NAME: Optional[str] = None
    
    # Database - URL format (alternative to individual fields)
    DATABASE_URL: Optional[str] = None

    # App
    APP_ENV: str
    APP_PORT: int

    # JWT
    JWT_SECRET_KEY: SecretStr
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_DAYS: int = 1000

    class Config:
        case_sensitive = True
        extra = "forbid"
        env_file = ".env"
        env_file_encoding = "utf-8"

    @model_validator(mode='after')
    def validate_database_config(self):
        """Ensure we have either DATABASE_URL or all individual DB fields."""
        has_database_url = bool(self.DATABASE_URL)
        has_individual_fields = all([
            self.DB_ENGINE, self.DB_USER, self.DB_PASSWORD, 
            self.DB_HOST, self.DB_PORT, self.DB_NAME
        ])
        
        if not has_database_url and not has_individual_fields:
            raise ValueError(
                "Either DATABASE_URL or all individual database fields "
                "(DB_ENGINE, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME) must be provided"
            )
        
        # If DATABASE_URL is provided and individual fields are missing, parse the URL
        if has_database_url and not has_individual_fields:
            try:
                parsed = urlparse(self.DATABASE_URL)
                
                # Extract components from DATABASE_URL
                if not self.DB_ENGINE:
                    # Convert postgresql:// to postgresql+psycopg2://
                    scheme = parsed.scheme
                    if scheme == "postgresql":
                        self.DB_ENGINE = "postgresql+psycopg2"
                    else:
                        self.DB_ENGINE = scheme
                
                if not self.DB_USER:
                    self.DB_USER = parsed.username
                
                if not self.DB_PASSWORD:
                    self.DB_PASSWORD = SecretStr(parsed.password) if parsed.password else None
                
                if not self.DB_HOST:
                    self.DB_HOST = parsed.hostname
                
                if not self.DB_PORT:
                    self.DB_PORT = parsed.port or 5432
                
                if not self.DB_NAME:
                    self.DB_NAME = parsed.path.lstrip('/')
                    
            except Exception as e:
                raise ValueError(f"Invalid DATABASE_URL format: {e}")
        
        return self

    def database_url(self) -> str:
        """
        Build the SQLAlchemy database URL safely.
        Supports both DATABASE_URL and individual field configurations.
        """
        # If DATABASE_URL is provided, use it directly
        if self.DATABASE_URL:
            # Ensure it uses the correct driver format for SQLAlchemy
            url = self.DATABASE_URL
            if url.startswith("postgresql://") and "+psycopg2" not in url:
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            
            # Apply localhost workaround if needed
            if "localhost" in url:
                url = url.replace("localhost", "127.0.0.1")
            
            logger.info("Using DATABASE_URL (masked): %s", self._mask_password_in_url(url))
            return url
        
        # Otherwise, build from individual fields
        password = self.DB_PASSWORD.get_secret_value().strip()  # remove trailing newlines/spaces

        # Workaround: prefer IPv4 loopback when 'localhost' is used. Many systems
        # resolve 'localhost' to ::1 (IPv6) and pg_hba rules may differ for ::1 vs 127.0.0.1.
        host = self.DB_HOST
        if isinstance(host, str) and host.lower() == "localhost":
            host = "127.0.0.1"

        url = URL.create(
            drivername=self.DB_ENGINE,
            username=self.DB_USER,
            password=password,
            host=host,
            port=self.DB_PORT,
            database=self.DB_NAME,
        )

        # Log a masked URL for debugging
        safe_url = url.render_as_string(hide_password=True)
        logger.info("Using database URL (from individual fields): %s", safe_url)

        # Return the full URL including the password so SQLAlchemy can connect.
        # SQLAlchemy's URL.__str__ may hide the password for safety, so explicitly
        # render with hide_password=False here.
        return url.render_as_string(hide_password=False)
    
    def _mask_password_in_url(self, url: str) -> str:
        """Helper method to mask password in URL for logging."""
        try:
            parsed = urlparse(url)
            if parsed.password:
                masked_netloc = parsed.netloc.replace(parsed.password, "***")
                return url.replace(parsed.netloc, masked_netloc)
        except Exception:
            pass
        return url

 
# Lazy singleton for global config
_config: AppConfig | None = None


def get_config() -> AppConfig:
    """Lazy accessor for the application config.

    Keeps the previous lazy-loading behavior but exposes a clearer name.
    Backwards-compatible helper `get_settings()` is provided below for callers
    that already import it.
    """
    global _config
    if _config is None:
        _config = AppConfig()  # loads from .env automatically
    return _config


# Backwards-compatible alias used across the codebase
def get_settings() -> AppConfig:
    return get_config()
