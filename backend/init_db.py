#DB initialization script

from app import app, db
from models import Product, ScanHistory

def init_database():
    """Initialize the database with tables"""
    with app.app_context():
        # Create all tables
        print("Creating database tables...")
        db.create_all()
        
        # Verify tables were created
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        print(f"Database created successfully!")
        print(f"Tables created: {', '.join(tables)}")
        
        # Print table schemas
        for table in tables:
            columns = inspector.get_columns(table)
            print(f"\n Table: {table}")
            for col in columns:
                print(f"   - {col['name']}: {col['type']}")

if __name__ == '__main__':
    init_database()