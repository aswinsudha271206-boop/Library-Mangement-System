# app/router/auth.py
import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
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

# Load configuration parameters from environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "SUPER_SECRET_ALEXANDRIA_KEY_CHANGE_THIS_IN_PRODUCTION")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    # Add expiration claim 'exp' to the JWT payload
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

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
    
    # Build JWT Token parameters using the .env configurable expiration
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {
        "sub": user.username,
        "role": user.role
    }
    
    encoded_jwt = create_access_token(data=token_payload, expires_delta=access_token_expires)
    
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role
    }