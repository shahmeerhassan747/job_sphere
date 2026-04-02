from sqlalchemy import Column, Integer, String
from models.base import Base

class FinalDetails(Base):
    __tablename__ = "final_details"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    additional_clauses = Column(String(100), nullable=True)
    legal_name = Column(String(100), nullable=True)
    dba = Column(String(100), nullable=True)
    emergency_email = Column(String(100), nullable=True)
    emergency_number = Column(String(100), nullable=True)
    full_address = Column(String(100), nullable=True)
    name_of_policy = Column(String(100), nullable=True)
    version_date = Column(String(100), nullable=True)
    other_regions = Column(String(100), nullable=True)
    user_id = Column(Integer, nullable=True)
    draft = Column(Integer, server_default="1", nullable=True)

    def __repr__(self):
        return f"<FinalDetails(id={self.id}, legal_name={self.legal_name}, emergency_email={self.emergency_email})>"
