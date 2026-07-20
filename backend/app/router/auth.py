# app/router/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

# Updated import path
from app.database.connection import get_db
from app.model import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication Engine"]
)

# Encryption context wrapper using standard bcrypt configurations
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "SUPER_SECRET_ALEXANDRIA_KEY_CHANGE_THIS_IN_PRODUCTION"
ALGORITHM = "HS256"

@router.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    # Look up user records by username
    user = db.query(models.User).filter(models.User.username == login_data.username).first()
    
    # Fail cleanly if user does not exist or password hash mismatch occurs
    if not user or not pwd_context.verify(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password credentials."
        )
    
    # Build JWT Token parameters
    token_expiry = datetime.utcnow() + timedelta(hours=8)
    token_payload = {
        "sub": user.username,
        "role": user.role,
        "exp": token_expiry
    }
    
    encoded_jwt = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role
    }