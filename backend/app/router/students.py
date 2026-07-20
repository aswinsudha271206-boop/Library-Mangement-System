# app/router/students.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.model import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/students",
    tags=["Student Profiles"]
)

# GET: Return all registered students/members
@router.get("", response_model=List[schemas.StudentResponse])
def get_all_students(db: Session = Depends(get_db)):
    return db.query(models.Student).order_by(models.Student.id.desc()).all()

@router.post("", response_model=schemas.StudentResponse, status_code=status.HTTP_201_CREATED)
def register_student(student_data: schemas.StudentCreate, db: Session = Depends(get_db)):
    # Check if student already exists by email or roll number
    existing_student = db.query(models.Student).filter(
        (models.Student.email == student_data.email) | 
        (models.Student.roll_number == student_data.roll_number)
    ).first()
    
    if existing_student:
        # If student exists, update and return them
        existing_student.name = student_data.name
        existing_student.phone = student_data.phone
        existing_student.track = student_data.track
        existing_student.academic_year = student_data.academic_year
        db.commit()
        db.refresh(existing_student)
        return existing_student
        
    new_student = models.Student(**student_data.model_dump())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student
