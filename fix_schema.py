import sqlalchemy as sa
from app.database import database

def migrate():
    print("Initializing engine...")
    database.init_engine()
    if database.SessionLocal is None:
        print("Error: SessionLocal is still None after init_engine()")
        return
        
    db = database.SessionLocal()
    try:
        print("Adding created_at...")
        db.execute(sa.text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
        print("Adding posted_by...")
        db.execute(sa.text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS posted_by INTEGER REFERENCES users(id)"))
        print("Adding image...")
        db.execute(sa.text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS image TEXT"))
        db.commit()
        print("Migration successful")
    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
