from sqlalchemy import create_engine
from models.base import Base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# Build database URL from environment variables
# First check if DATABASE_URL is provided directly
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fall back to building from individual components
    DB_ENGINE = os.getenv("DB_ENGINE", "postgresql+psycopg2")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "hms_saas")
    
    DATABASE_URL = f"{DB_ENGINE}://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create engine
engine = create_engine(DATABASE_URL, echo=True)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Function to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Import all models here for Alembic to detect them
from models.final_details import FinalDetails  # noqa: E402
from models.collection_of_info import CollectionOfInfo
from models.use_of_info import UseOfInfo
from models.use_of_tracking_tech import UseOfTrackingTech
from models.user_rights import UserRights
from models.usr_info import UsrInfo
from models.policy_uses import PolicyUses 
from models.job import Job
from models.salary import Salary
from models.company import Company


# Optional: Create all tables (useful for initial setup)
def create_tables():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully!")


if __name__ == "__main__":
    # This will create tables if you run: python main.py
    create_tables()
