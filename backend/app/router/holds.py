# app/router/holds.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.database.connection import get_db
from app.model import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/holds",
    tags=["Hold Management Actions"]
)

# ₹25 is charged for every day a book sits past its due date, per the
# banner shown on the storefront. This was previously just static text —
# nothing ever computed a fine or flipped a hold to "Overdue".
FINE_PER_DAY = 25.0


def _compute_effective_state(status_val: str, base_amount, due_date):
    """
    Derives the *display* status/amount for a hold, layering the overdue
    fine on top of the base amount without mutating the database. Only
    "Active" holds past their due_date are affected — Returned/cancelled
    holds keep whatever amount was locked in when they were closed out.
    Returns (effective_status, effective_amount, days_overdue).
    """
    base_amount = base_amount if base_amount is not None else 0.0
    status_val = status_val or "Active"

    if status_val == "Active" and due_date is not None:
        now = datetime.now(timezone.utc) if due_date.tzinfo else datetime.utcnow()
        if now > due_date:
            days_overdue = max((now - due_date).days, 1)
            fine = FINE_PER_DAY * days_overdue
            return "Overdue", base_amount + fine, days_overdue

    return status_val, base_amount, 0

# GET: Return all holds enriched with book title and student name safely
@router.get("", response_model=List[schemas.HoldResponse])
def get_all_holds(db: Session = Depends(get_db)):
    try:
        results = (
            db.query(models.Hold, models.Book.title, models.Student.name)
            .outerjoin(models.Book, models.Hold.book_id == models.Book.id)
            .outerjoin(models.Student, models.Hold.user_id == models.Student.id)
            .order_by(models.Hold.id.desc())
            .all()
        )
        
        enriched_holds = []
        for hold, book_title, student_name in results:
            eff_status, eff_amount, _ = _compute_effective_state(
                hold.status, hold.amount, getattr(hold, "due_date", None)
            )
            hold_dict = {
                "id": hold.id,
                "book_id": hold.book_id,
                "user_id": hold.user_id,
                "amount": eff_amount,
                "payment_method": hold.payment_method or "Cash",
                "status": eff_status,
                "enrollment_track": getattr(hold, "enrollment_track", "bachelor"),
                "transaction_type": getattr(hold, "transaction_type", "lending"),
                "created_at": hold.created_at,
                "due_date": getattr(hold, "due_date", None),
                "returned_at": getattr(hold, "returned_at", None),
                "book_title": book_title or f"Book #{hold.book_id}",
                "student_name": student_name or f"Student #{hold.user_id}"
            }
            enriched_holds.append(hold_dict)
            
        return enriched_holds
    except Exception as e:
        db.rollback()
        print(f"ERROR in get_all_holds: {str(e)}")
        fallback_holds = db.query(models.Hold).order_by(models.Hold.id.desc()).all()
        fallback_result = []
        for h in fallback_holds:
            eff_status, eff_amount, _ = _compute_effective_state(
                h.status, h.amount, getattr(h, "due_date", None)
            )
            fallback_result.append({
                "id": h.id,
                "book_id": h.book_id,
                "user_id": h.user_id,
                "amount": eff_amount,
                "payment_method": h.payment_method or "Cash",
                "status": eff_status,
                "enrollment_track": getattr(h, "enrollment_track", "bachelor"),
                "transaction_type": getattr(h, "transaction_type", "lending"),
                "created_at": h.created_at,
                "due_date": getattr(h, "due_date", None),
                "returned_at": getattr(h, "returned_at", None),
                "book_title": f"Book #{h.book_id}",
                "student_name": f"Student #{h.user_id}"
            })
        return fallback_result

# 📈 GET: Fetch total current system metrics for dashboard summary counters
@router.get("/count")
def get_active_holds_count(db: Session = Depends(get_db)):
    total_active = db.query(models.Hold).filter(models.Hold.status == "Active").count()
    return {"active_holds_count": total_active}

# 🎯 POST: Place an active title hold reservation block with new tracks & transaction options
@router.post("", response_model=schemas.HoldResponse, status_code=status.HTTP_201_CREATED)
def place_book_hold(hold_data: schemas.HoldCreate, db: Session = Depends(get_db)):
    try:
        # 1. Verify target book exists
        target_book = db.query(models.Book).filter(models.Book.id == hold_data.book_id).first()
        if not target_book:
            raise HTTPException(status_code=404, detail="Target catalog book item not found.")

        # 2. Prevent placing a hold on a book that's already borrowed/sold/unavailable
        if target_book.status != "Available":
            raise HTTPException(
                status_code=400,
                detail=f"'{target_book.title}' is currently {target_book.status.lower()} and not available for hold."
            )

        # 3. Verify target student exists to prevent Database Foreign Key Failures
        target_student = db.query(models.Student).filter(models.Student.id == hold_data.user_id).first()
        if not target_student:
            raise HTTPException(
                status_code=404,
                detail=f"Student record with ID #{hold_data.user_id} not found. Please register/verify a digital pass first."
            )

        # 4. Check for duplicate active holds
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

        # 5. Save hold record
        new_hold = models.Hold(
            book_id=hold_data.book_id,
            user_id=hold_data.user_id,
            amount=hold_data.amount,
            payment_method=hold_data.payment_method,
            status="Active",
            enrollment_track=hold_data.enrollment_track,
            transaction_type=hold_data.transaction_type,
            due_date=hold_data.due_date
        )
        db.add(new_hold)

        # 6. Update book status
        target_book.status = "Sold" if hold_data.transaction_type == "sales" else "Borrowed"
        db.add(target_book)

        db.commit()
        db.refresh(new_hold)
        db.refresh(target_book)
        
        return {
            "id": new_hold.id,
            "book_id": new_hold.book_id,
            "user_id": new_hold.user_id,
            "amount": new_hold.amount if new_hold.amount is not None else 0.0,
            "payment_method": new_hold.payment_method or "Cash",
            "status": new_hold.status or "Active",
            "enrollment_track": getattr(new_hold, "enrollment_track", "bachelor"),
            "transaction_type": getattr(new_hold, "transaction_type", "lending"),
            "created_at": new_hold.created_at,
            "due_date": getattr(new_hold, "due_date", None),
            "returned_at": getattr(new_hold, "returned_at", None),
            "book_title": target_book.title,
            "student_name": target_student.name
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"CRITICAL ERROR in place_book_hold: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database execution failed: {str(e)}"
        )

# 🔁 PUT: Update a hold record — most importantly, mark it Returned so the
# overdue fine clock stops and the book goes back on the shelf. The frontend
# (Transactions.jsx edit button) already calls this route; it just never
# existed on the backend before now.
@router.put("/{hold_id}", response_model=schemas.HoldResponse)
def update_hold(hold_id: int, hold_update: schemas.HoldUpdate, db: Session = Depends(get_db)):
    try:
        hold_record = db.query(models.Hold).filter(models.Hold.id == hold_id).first()
        if not hold_record:
            raise HTTPException(status_code=404, detail=f"Hold record with ID #{hold_id} not found.")

        becoming_returned = hold_update.status == "Returned" and hold_record.status != "Returned"

        if becoming_returned:
            # Lock in whatever fine had actually accrued as of right now,
            # rather than trusting a possibly stale amount from the edit form.
            _, effective_amount, _ = _compute_effective_state(
                "Active", hold_record.amount, getattr(hold_record, "due_date", None)
            )
            hold_record.amount = max(effective_amount, hold_update.amount)
            hold_record.returned_at = datetime.utcnow()
        else:
            hold_record.amount = hold_update.amount

        hold_record.book_id = hold_update.book_id
        hold_record.user_id = hold_update.user_id
        hold_record.payment_method = hold_update.payment_method
        hold_record.due_date = hold_update.due_date
        hold_record.status = hold_update.status
        db.add(hold_record)

        # Keep the book's availability in sync with the loan's lifecycle
        target_book = db.query(models.Book).filter(models.Book.id == hold_record.book_id).first()
        if target_book:
            if becoming_returned:
                target_book.status = "Available"
            elif hold_update.status in ("Active", "Overdue") and target_book.status == "Available":
                target_book.status = "Sold" if hold_record.transaction_type == "sales" else "Borrowed"
            db.add(target_book)

        db.commit()
        db.refresh(hold_record)

        student = db.query(models.Student).filter(models.Student.id == hold_record.user_id).first()
        book = db.query(models.Book).filter(models.Book.id == hold_record.book_id).first()

        eff_status, eff_amount, _ = _compute_effective_state(
            hold_record.status, hold_record.amount, getattr(hold_record, "due_date", None)
        )

        return {
            "id": hold_record.id,
            "book_id": hold_record.book_id,
            "user_id": hold_record.user_id,
            "amount": eff_amount,
            "payment_method": hold_record.payment_method or "Cash",
            "status": eff_status,
            "enrollment_track": getattr(hold_record, "enrollment_track", "bachelor"),
            "transaction_type": getattr(hold_record, "transaction_type", "lending"),
            "created_at": hold_record.created_at,
            "due_date": getattr(hold_record, "due_date", None),
            "returned_at": getattr(hold_record, "returned_at", None),
            "book_title": book.title if book else f"Book #{hold_record.book_id}",
            "student_name": student.name if student else f"Student #{hold_record.user_id}"
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"CRITICAL ERROR in update_hold: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database update failed: {str(e)}"
        )

# ❌ DELETE: Remove or cancel an active hold/transaction record by ID
@router.delete("/{hold_id}", status_code=status.HTTP_200_OK)
def delete_hold(hold_id: int, db: Session = Depends(get_db)):
    try:
        hold_record = db.query(models.Hold).filter(models.Hold.id == hold_id).first()
        if not hold_record:
            raise HTTPException(status_code=404, detail=f"Hold record with ID #{hold_id} not found.")

        target_book = db.query(models.Book).filter(models.Book.id == hold_record.book_id).first()
        if target_book and target_book.status != "Available":
            target_book.status = "Available"
            db.add(target_book)

        db.delete(hold_record)
        db.commit()
        return {"message": f"Hold record #{hold_id} successfully deleted.", "id": hold_id}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"CRITICAL ERROR in delete_hold: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database deletion failed: {str(e)}"
        )