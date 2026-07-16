# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext

from app.config.database.connection import engine, SessionLocal
from app.model import models
from app.router import books, auth # Import new auth module router

# Auto-compile target application tables
models.Base.metadata.create_all(bind=engine)

# --- Automatic Admin User Database Seeding Strategy ---
def seed_default_user():
    db = SessionLocal()
    try:
        # Check if any users exist
        user_count = db.query(models.User).count()
        if user_count == 0:
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            hashed_pw = pwd_context.hash("admin123")
            
            default_admin = models.User(
                username="admin",
                password_hash=hashed_pw,
                role="admin"
            )
            db.add(default_admin)
            db.commit()
            print("Successfully seeded database with system administrator default user configuration.")
    finally:
        db.close()

seed_default_user()

app = FastAPI(
    title="Alexandria API Engine",
    version="1.0.0",
    description="Scalable system service interface managing library data schemas"
)

# 🛡️ CORS Cross-Origin Resource Policy Management Setup 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Connects to your React layout terminal workspace
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register operations router component modules
app.include_router(books.router)
app.include_router(auth.router) # Mount authentication router endpoints

@app.get("/")
def health_check():
    return {"status": "operational", "service": "Alexandria Backend Terminal Engine"}