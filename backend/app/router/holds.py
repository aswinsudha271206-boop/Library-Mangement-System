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

# GET: Return all holds enriched with book title
@router.get("", response_model=List[schemas.HoldResponse])
def get_all_holds(db: Session = Depends(get_db)):
    return db.query(models.Hold).order_by(models.Hold.id.desc()).all()

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
        status="Active"
    )
    db.add(new_hold)
    db.commit()
    db.refresh(new_hold)
    return new_hold