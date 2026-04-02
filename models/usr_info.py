from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.orm import relationship
from models.base import Base

class UsrInfo(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500))
    email = Column(String(500), unique=True, index=True)
    password = Column(String(500))
    role = Column(String(500))
    avatar = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
