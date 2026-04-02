"""Database package initialization."""

from .database import Base, init_engine, dispose_engine, get_db, init_app

# ADD THIS LINE 👇
import app.database.schema 

__all__ = ["Base", "init_engine", "dispose_engine", "get_db", "init_app"]
