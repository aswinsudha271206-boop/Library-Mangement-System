# app/router/holds.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.connection import get_db
from app.model import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/holds",
    tags=["Hold Management Actions"]
)

# GET: Return all holds enriched with book title and student name safely
@router.get("", response_model=List[schemas.HoldResponse])
def get_all_holds(db: Session = Depends(get_db)):
    try:
        # Join against models.Student instead of models.User
        results = (
            db.query(models.Hold, models.Book.title, models.Student.name)
            .outerjoin(models.Book, models.Hold.book_id == models.Book.id)
            .outerjoin(models.Student, models.Hold.user_id == models.Student.id)
            .order_by(models.Hold.id.desc())
            .all()
        )
        
        enriched_holds = []
        for hold, book_title, student_name in results:
            hold_dict = {
                "id": hold.id,
                "book_id": hold.book_id,
                "user_id": hold.user_id,
                "amount": hold.amount if hold.amount is not None else 0.0,
                "payment_method": hold.payment_method or "Cash",
                "status": hold.status or "Active",
                "created_at": hold.created_at,
                "due_date": getattr(hold, "due_date", None),
                "returned_at": getattr(hold, "returned_at", None),
                "book_title": book_title or f"Book #{hold.book_id}",
                "student_name": student_name or f"Student #{hold.user_id}"
            }
            enriched_holds.append(hold_dict)
            
        return enriched_holds
    except Exception as e:
        print(f"ERROR in get_all_holds: {str(e)}")
        fallback_holds = db.query(models.Hold).order_by(models.Hold.id.desc()).all()
        return [
            {
                "id": h.id,
                "book_id": h.book_id,
                "user_id": h.user_id,
                "amount": h.amount if h.amount is not None else 0.0,
                "payment_method": h.payment_method or "Cash",
                "status": h.status or "Active",
                "created_at": h.created_at,
                "due_date": getattr(h, "due_date", None),
                "returned_at": getattr(h, "returned_at", None),
                "book_title": f"Book #{h.book_id}",
                "student_name": f"Student #{h.user_id}"
            } 
            for h in fallback_holds
        ]

# 📈 GET: Fetch total current system metrics for dashboard summary counters
@router.get("/count")
def get_active_holds_count(db: Session = Depends(get_db)):
    total_active = db.query(models.Hold).filter(models.Hold.status == "Active").count()
    return {"active_holds_count": total_active}

# 🎯 POST: Place an active title hold reservation block
@router.post("", response_model=schemas.HoldResponse, status_code=status.HTTP_201_CREATED)
def place_book_hold(hold_data: schemas.HoldCreate, db: Session = Depends(get_db)):
    # 1. Verify target volume element index exists
    target_book = db.query(models.Book).filter(models.Book.id == hold_data.book_id).first()
    if not target_book:
        raise HTTPException(status_code=404, detail="Target catalog book item not found.")

    # 2. Check if this user already possesses a concurrent reservation block on the title
    duplicate_check = db.query(models.Hold).filter(
        models.Hold.book_id == hold_data.book_id,
        models.Hold.user_id == hold_data.user_id,
        models.Hold.status == "Active"
    ).first()
    
    if duplicate_check:
        raise HTTPException(
            status_code=400, 
            detail="An active reservation queue record already exists under your profile for this book."
        )

    # 3. Commit new transaction entry sequence
    new_hold = models.Hold(
        book_id=hold_data.book_id,
        user_id=hold_data.user_id,
        amount=hold_data.amount,
        payment_method=hold_data.payment_method,
        status="Active",
        due_date=getattr(hold_data, "due_date", None)
    )
    db.add(new_hold)
    db.commit()
    db.refresh(new_hold)
    
# Change target_user lookup to target_student
    target_student = db.query(models.Student).filter(models.Student.id == new_hold.user_id).first()
    return {
        "id": new_hold.id,
        "book_id": new_hold.book_id,
        "user_id": new_hold.user_id,
        "amount": new_hold.amount or 0.0,
        "payment_method": new_hold.payment_method or "Cash",
        "status": new_hold.status,
        "created_at": new_hold.created_at,
        "due_date": getattr(new_hold, "due_date", None),
        "returned_at": getattr(new_hold, "returned_at", None),
        "book_title": target_book.title,
        "student_name": target_student.name if target_student else f"Student #{new_hold.user_id}"
    }