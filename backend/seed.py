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
    default_books = [
        models.Book(title="Designing Data-Intensive Applications", author="Martin Kleppmann", isbn="978-1449373320", genre="Tech", status="Available"),
        models.Book(title="Clean Code", author="Robert C. Martin", isbn="978-0132350884", genre="Tech", status="Borrowed"),
        models.Book(title="The Pragmatic Programmer", author="Andrew Hunt & David Thomas", isbn="978-0135957059", genre="Tech", status="Available"),
        models.Book(title="Refactoring", author="Martin Fowler", isbn="978-0134757599", genre="Tech", status="Available"),
        models.Book(title="Introduction to Algorithms", author="Thomas H. Cormen", isbn="978-0262046305", genre="Tech", status="Available"),
        models.Book(title="Structure and Interpretation of Computer Programs", author="Harold Abelson", isbn="978-0262510875", genre="Tech", status="Available"),
        models.Book(title="Code Complete", author="Steve McConnell", isbn="978-0735619678", genre="Tech", status="Available"),
        models.Book(title="You Don't Know JS Yet", author="Kyle Simpson", isbn="978-1491904244", genre="Tech", status="Borrowed"),
        models.Book(title="The Mythical Man-Month", author="Frederick P. Brooks Jr.", isbn="978-0201835953", genre="Tech", status="Available"),
        models.Book(title="System Design Interview", author="Alex Xu", isbn="978-1736049112", genre="Tech", status="Available"),
        models.Book(title="Head First Design Patterns", author="Eric Freeman", isbn="978-1492078005", genre="Tech", status="Available"),
        models.Book(title="Deep Work", author="Cal Newport", isbn="978-1455586691", genre="Productivity", status="Available"),
        models.Book(title="Atomic Habits", author="James Clear", isbn="978-0735211292", genre="Self-Help", status="Borrowed"),
        models.Book(title="The Psychology of Money", author="Morgan Housel", isbn="978-0857197689", genre="Finance", status="Available"),
        models.Book(title="Sapiens: A Brief History of Humankind", author="Yuval Noah Harari", isbn="978-0062316097", genre="History", status="Available"),
        models.Book(title="Dune", author="Frank Herbert", isbn="978-0441172719", genre="Sci-Fi", status="Available"),
        models.Book(title="The Hobbit", author="J.R.R. Tolkien", isbn="978-0547928227", genre="Fantasy", status="Borrowed"),
        models.Book(title="1984", author="George Orwell", isbn="978-0451524935", genre="Fiction", status="Available"),
        models.Book(title="To Kill a Mockingbird", author="Harper Lee", isbn="978-0060935467", genre="Fiction", status="Available"),
        models.Book(title="The Great Gatsby", author="F. Scott Fitzgerald", isbn="978-0743273565", genre="Classic", status="Available"),
        models.Book(title="Brave New World", author="Aldous Huxley", isbn="978-0060850524", genre="Sci-Fi", status="Available"),
        models.Book(title="Steve Jobs", author="Walter Isaacson", isbn="978-1451648539", genre="Biography", status="Available"),
        models.Book(title="Elon Musk", author="Walter Isaacson", isbn="978-1982181284", genre="Biography", status="Borrowed"),
        models.Book(title="Zero to One", author="Peter Thiel", isbn="978-0804139298", genre="Business", status="Available"),
        models.Book(title="The Lean Startup", author="Eric Ries", isbn="978-0307887894", genre="Business", status="Available"),
        models.Book(title="Artificial Intelligence: A Modern Approach", author="Stuart Russell", isbn="978-0134610993", genre="Tech", status="Available"),
        models.Book(title="Clean Architecture", author="Robert C. Martin", isbn="978-0134494166", genre="Tech", status="Borrowed"),
        models.Book(title="Kubernetes Up & Running", author="Brendan Burns", isbn="978-1492046530", genre="Tech", status="Available"),
        models.Book(title="Python Crash Course", author="Eric Matthes", isbn="978-1593279288", genre="Tech", status="Available"),
        models.Book(title="Rust in Action", author="Tim McNamara", isbn="978-1617294556", genre="Tech", status="Available"),
        models.Book(title="Continuous Delivery", author="Jez Humble & David Farley", isbn="978-0321601910", genre="Tech", status="Available"),
        models.Book(title="Site Reliability Engineering", author="Betsy Beyer", isbn="978-1491929124", genre="Tech", status="Borrowed"),
    ]
    
    existing_isbns = set(b[0] for b in db.query(models.Book.isbn).all())
    added_count = 0
    for book in default_books:
        if book.isbn not in existing_isbns:
            db.add(book)
            added_count += 1
            
    if added_count > 0:
        db.commit()
        print(f"[+] Added {added_count} new books to inventory.")
    else:
        print("[*] Book catalog is already up to date.")

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