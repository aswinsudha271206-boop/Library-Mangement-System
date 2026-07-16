# app/schemas/schemas.py
from pydantic import BaseModel

# --- Existing Book Schemas ---
class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    genre: str
    status: str

class BookUpdate(BaseModel):
    status: str

class BookResponse(BookBase):
    id: int
    class Config:
        from_attributes = True

# --- New Authentication Schemas ---
class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str