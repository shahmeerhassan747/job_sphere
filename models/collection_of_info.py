from sqlalchemy import Column, Integer, String
from models.base import Base

class CollectionOfInfo(Base):
    __tablename__ = "collection_of_info"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    sensitive_info = Column(String(1000), nullable=True)
    social_info = Column(Integer, nullable=True)
    derivative_data = Column(String(1000), nullable=True)
    geo_location = Column(Integer, nullable=True)
    mobile_features = Column(String(1000), nullable=True)
    mobile_devices = Column(Integer, nullable=True)
    notification = Column(Integer, nullable=True)
    offer_wall = Column(Integer, nullable=True)
    google_apis = Column(Integer, nullable=True)
    other_services = Column(Integer, nullable=True)
    personal_info = Column(String(1000), nullable=True)
    user_id = Column(Integer, nullable=True)
    draft = Column(Integer, server_default="1", nullable=True)

    def __repr__(self):
        return f"<CollectionOfInfo(id={self.id}, personal_info={self.personal_info})>"
