"""
Initialize the database with tables.
Run this script to create all tables: python -m app.init_db
"""
from .database import engine
from .models import Base


def init_db():
    """Create all tables in the database."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()
