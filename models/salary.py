from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from models.base import Base

class Salary(Base):
    __tablename__ = "salaries"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    min_salary = Column(Integer)
    max_salary = Column(Integer)
    currency = Column(String(10))
    location = Column(String(500))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    job = relationship("Job", back_populates="salaries")

    def __repr__(self):
        return f"<Salary(id={self.id}, job_id={self.job_id})>"
