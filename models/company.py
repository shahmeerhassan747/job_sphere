from sqlalchemy import Column, Integer, String, TIMESTAMP, func
from sqlalchemy.orm import relationship
from models.base import Base

class Company(Base):
    __tablename__ = "companies"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String(500))
    email = Column(String(500))
    logo = Column(String)  # TEXT in SQL
    industry = Column(String(500))
    location = Column(String(500))
    website = Column(String(500))
    description = Column(String)  # TEXT in SQL
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Company(id={self.id}, name={self.name})>"
