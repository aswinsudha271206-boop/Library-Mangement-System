# app/schemas/schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# --- Existing Book Schemas ---
class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    genre: str
    status: str
    reservation_fee: float = 2.00

class BookUpdate(BaseModel):
    title: str
    author: str
    isbn: str
    genre: str
    status: str
    reservation_fee: float

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

# --- Hold Schemas ---
class HoldUpdate(BaseModel):
    book_id: int
    user_id: int
    amount: float
    payment_method: str
    due_date: Optional[datetime] = None
    status: str

class HoldCreate(BaseModel):
    book_id: int
    user_id: int
    amount: float
    payment_method: str
    enrollment_track: Optional[str] = "bachelor"  # 🆕 Added
    transaction_type: Optional[str] = "lending"  # 🆕 Added
    due_date: Optional[datetime] = None
    
class HoldResponse(BaseModel):
    id: int
    book_id: int
    user_id: int
    status: str
    amount: float
    payment_method: str
    enrollment_track: Optional[str] = "bachelor"  
    transaction_type: Optional[str] = "lending"  
    created_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    returned_at: Optional[datetime] = None
    book_title: Optional[str] = None
    student_name: Optional[str] = None

    class Config:
        from_attributes = True

# --- New Student/Digital Pass Schemas ---
class StudentCreate(BaseModel):
    name: str
    email: str
    roll_number: str
    phone: str
    track: str
    academic_year: str

class StudentResponse(StudentCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True