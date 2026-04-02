from sqlalchemy import Column, Integer, String
from models.base import Base

class UserRights(Base):
    __tablename__ = "user_rights"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    dpo = Column(String(100), nullable=True)
    consent_settings = Column(Integer, nullable=True)
    data_access_request = Column(String(100), nullable=True)
    gpc = Column(Integer, nullable=True)
    user_id = Column(Integer, nullable=True)
    draft = Column(Integer, server_default="1", nullable=True)

    def __repr__(self):
        return f"<UserRights(id={self.id}, dpo={self.dpo}, gpc={self.gpc})>"
