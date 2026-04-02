from sqlalchemy import Column, Integer, String
from models.base import Base

class UseOfTrackingTech(Base):
    __tablename__ = "use_of_tracking_tech"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    tracking_tech = Column(String(100), nullable=True)
    google_analytics = Column(String(100), nullable=True)
    user_id = Column(Integer, nullable=True)
    draft = Column(Integer, server_default="1", nullable=True)

    def __repr__(self):
        return f"<UseOfTrackingTech(id={self.id}, tracking_tech={self.tracking_tech})>"
