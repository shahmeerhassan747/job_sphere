from sqlalchemy import Column, Integer, String
from models.base import Base

class UseOfInfo(Base):
    __tablename__ = "use_of_info"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    contract_interests = Column(String(1000), nullable=True)
    legitimate_interest = Column(String(1000), nullable=True)
    promotional_com = Column(String(1000), nullable=True)
    user_id = Column(Integer, nullable=True)
    draft = Column(Integer, server_default="1", nullable=True)

    def __repr__(self):
        return f"<UseOfInfo(id={self.id}, contract_interests={self.contract_interests})>"
