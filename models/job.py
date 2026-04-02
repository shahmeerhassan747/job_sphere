from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from models.base import Base

class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    title = Column(String(500))
    description = Column(String)  # TEXT in SQL
    location = Column(String(500))
    type = Column(String(100))
    company_id = Column(Integer, ForeignKey("companies.id"))
    posted_by = Column(Integer, ForeignKey("users.id"))
    image = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    user = relationship("UsrInfo", back_populates="jobs")
    company = relationship("Company", back_populates="jobs")
    # salaries and applications with cascade
    salaries = relationship("Salary", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Job(id={self.id}, title={self.title})>"
