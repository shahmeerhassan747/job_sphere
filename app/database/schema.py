"""SQLAlchemy models for the Twitter clone database."""

from sqlalchemy import Column, Integer, String, Float
from app.database import Base


class Tweet(Base):
    __tablename__ = "tweet"

    id = Column(Integer, primary_key=True, index=True)
    profile_name = Column(String(100))
    likes = Column(Integer)
    reposts = Column(Float)
    saves = Column(Integer)
