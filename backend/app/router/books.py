# app/router/books.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.config.database.connection import get_db
from app.model import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/books",
    tags=["Library Catalog Actions"]
)

# 📋 GET: Fetch entire library index matching frontend state arrays
@router.get("", response_model=List[schemas.BookResponse])
def get_all_books(db: Session = Depends(get_db)):
    return db.query(models.Book).order_by(models.Book.id.desc()).all()

# 📝 POST: Create/Register a new volume tracking item inside tables
@router.post("", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(book: schemas.BookBase, db: Session = Depends(get_db)):
    # Verify duplicate ISBN exceptions
    db_book = db.query(models.Book).filter(models.Book.isbn == book.isbn).first()
    if db_book:
        raise HTTPException(status_code=400, detail="A book with this ISBN already exists.")
    
    new_book = models.Book(**book.model_dump())
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book

# 🔄 PUT: Update circulation metrics or transaction status states
@router.put("/{book_id}", response_model=schemas.BookResponse)
def update_book_status(book_id: int, book_update: schemas.BookUpdate, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Requested book tracking record not found.")
    
    db_book.status = book_update.status
    db.commit()
    db.refresh(db_book)
    return db_book

# 🗑️ DELETE: Purge catalog elements out of persistent tables
@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Target catalog entry metadata not found.")
    
    db.delete(db_book)
    db.commit()
    return None