import sys
from passlib.context import CryptContext
from app.database.connection import engine, SessionLocal
from app.model import models

def init_db():
    models.Base.metadata.create_all(bind=engine)

def drop_db():
    models.Base.metadata.drop_all(bind=engine)

def seed_default_user(db):
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    DEFAULT_ADMIN_USERNAME = "admin"
    DEFAULT_ADMIN_PASSWORD = "admin@2026"
    
    admin_user = db.query(models.User).filter(models.User.role == "admin").first()
    
    if not admin_user:
        hashed_pw = pwd_context.hash(DEFAULT_ADMIN_PASSWORD)
        default_admin = models.User(
            username=DEFAULT_ADMIN_USERNAME,
            password_hash=hashed_pw,
            role="admin"
        )
        db.add(default_admin)
        db.commit()
        print("[+] Admin user created.")
    else:
        updated = False
        if admin_user.username != DEFAULT_ADMIN_USERNAME:
            admin_user.username = DEFAULT_ADMIN_USERNAME
            updated = True
        
        if not pwd_context.verify(DEFAULT_ADMIN_PASSWORD, admin_user.password_hash):
            admin_user.password_hash = pwd_context.hash(DEFAULT_ADMIN_PASSWORD)
            updated = True
            
        if updated:
            db.commit()
            print("[+] Admin user credentials updated.")

def seed_default_books(db):
    book_count = db.query(models.Book).count()
    if book_count == 0:
        default_books = [
            models.Book(
                title="Designing Data-Intensive Applications", 
                author="Martin Kleppmann", 
                isbn="978-1449373320", 
                genre="Tech", 
                status="Available"
            ),
            models.Book(
                title="Clean Code", 
                author="Robert C. Martin", 
                isbn="978-0132350884", 
                genre="Tech", 
                status="Borrowed"
            ),
        ]
        db.add_all(default_books)
        db.commit()
        print("[+] Initial book inventory added.")

def run_seed(reset: bool = False):
    if reset:
        print("[!] Dropping all existing tables...")
        drop_db()
    
    print("[*] Initializing database tables...")
    init_db()
    
    db = SessionLocal()
    try:
        print("[*] Seeding database with initial data...")
        seed_default_user(db)
        seed_default_books(db)
        print("[✓] Database seeding completed successfully.")
    except Exception as e:
        print(f"[X] Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    should_reset = "--reset" in sys.argv
    run_seed(reset=should_reset)