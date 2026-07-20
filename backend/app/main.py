# app/main.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from passlib.context import CryptContext

# Updated import path
from app.database.connection import engine, SessionLocal
from app.model import models
from app.router import students, auth, books, holds

# --- MULTI-IP WHITELIST CONFIGURATION ---
ALLOWED_IPS = ["192.168.1.34", "127.0.0.1", "::1", "192.168.1.73", "10.0.0.5"]

class NetworkFilterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Always allow CORS preflight (OPTIONS) requests through
        if request.method == "OPTIONS":
            return await call_next(request)

        client_ip = request.client.host
        print(f"DEBUG: Incoming request from IP: {client_ip}") # Check your terminal
        
        # Temporarily comment out or relax the check for local testing:
        # if client_ip not in ALLOWED_IPS:
        #     raise HTTPException(status_code=403, detail=f"Network access denied for {client_ip}")
            
        return await call_next(request)

# Auto-compile target application tables
models.Base.metadata.create_all(bind=engine)

# --- Automatic Admin User Database Seeding Strategy ---
def seed_default_user():
    db = SessionLocal()
    try:
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        DEFAULT_ADMIN_USERNAME = "admin"
        DEFAULT_ADMIN_PASSWORD = "admin@2026"
        
        admin_user = db.query(models.User).filter(models.User.role == "admin").first()
        
        if not admin_user:
            hashed_pw = pwd_context.hash(DEFAULT_ADMIN_PASSWORD)
            default_admin = models.User(
                username=DEFAULT_ADMIN_USERNAME,
                password_hash=hashed_pw,
                role="admin"
            )
            db.add(default_admin)
            db.commit()
        else:
            updated = False
            if admin_user.username != DEFAULT_ADMIN_USERNAME:
                admin_user.username = DEFAULT_ADMIN_USERNAME
                updated = True
            
            if not pwd_context.verify(DEFAULT_ADMIN_PASSWORD, admin_user.password_hash):
                admin_user.password_hash = pwd_context.hash(DEFAULT_ADMIN_PASSWORD)
                updated = True
                
            if updated:
                db.commit()
    finally:
        db.close()

seed_default_user()

def seed_default_books():
    db = SessionLocal()
    try:
        book_count = db.query(models.Book).count()
        if book_count == 0:
            default_books = [
                models.Book(id=1, title="Designing Data-Intensive Applications", author="Martin Kleppmann", isbn="978-1449373320", genre="Tech", status="Available"),
                models.Book(id=2, title="Clean Code", author="Robert C. Martin", isbn="978-0132350884", genre="Tech", status="Borrowed"),
            ]
            db.add_all(default_books)
            db.commit()
    finally:
        db.close()

seed_default_books()

app = FastAPI(
    title="Alexandria API Engine",
    version="1.0.0",
    description="Scalable system service interface managing library data schemas"
)

# --- ADD MIDDLEWARE HERE ---
app.add_middleware(NetworkFilterMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register operations router component modules
app.include_router(books.router)
app.include_router(auth.router)
app.include_router(holds.router)
app.include_router(students.router)

@app.get("/")
def health_check():
    return {"status": "operational", "service": "Alexandria Backend Terminal Engine"}