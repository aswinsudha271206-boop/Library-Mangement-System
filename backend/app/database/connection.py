# app/config/database/connection.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# PostgreSQL Connection String (Adjust credentials to match your local setup)
DATABASE_URL = "postgresql://postgres:your_secure_password@localhost:5432/alexandria_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Context manager dependency to cleanly open and close database connection instances
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        hi