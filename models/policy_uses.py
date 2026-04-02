from sqlalchemy import Column, Integer, String
from models.base import Base

class PolicyUses(Base):
    __tablename__ = "policy_uses"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    mobile_app = Column(String(100), nullable=True)
    website = Column(String(100), nullable=True)
    facebook_app = Column(String(100), nullable=True)
    english_preferences = Column(Integer, nullable=True)
    use_description = Column(String(100), nullable=True)
    user_id = Column(Integer, nullable=True)
    draft = Column(Integer, server_default="1", nullable=True)

    def __repr__(self):
        return f"<PolicyUses(id={self.id}, mobile_app={self.mobile_app}, website={self.website})>"
