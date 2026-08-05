# app/model/models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from app.database.connection import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    isbn = Column(String, unique=True, nullable=False, index=True)
    genre = Column(String, nullable=False)
    status = Column(String, default="Available", nullable=False)
    reservation_fee = Column(Float, default=2.00, nullable=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="client", nullable=False) # "admin" or "client"

class Hold(Base):
    __tablename__ = "holds"
    
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    
    # ✅ Correctly points to students.id to match your SQL schema update
    user_id = Column(Integer, ForeignKey("students.id"), nullable=False) 
    
    amount = Column(Float, default=0.0)
    payment_method = Column(String, default="Cash")
    status = Column(String, default="Active")
    enrollment_track = Column(String, default="bachelor")    
    transaction_type = Column(String, default="lending")   
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    due_date = Column(DateTime(timezone=True), nullable=True)
    returned_at = Column(DateTime(timezone=True), nullable=True)
    
class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    roll_number = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=False)
    track = Column(String, nullable=False)
    academic_year = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())