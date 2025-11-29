"""
Database Initialization Script
Initializes SQLite database with schema and seed data.
Run this once to set up the database for OpenLedger Black.
"""

import sqlite3
import os


def init_database():
    """Initialize database with schema and seed data"""
    
    # Paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, '..', 'openledger.db')
    schema_path = os.path.join(base_dir, '..', 'database', 'schema.sql')
    seed_path = os.path.join(base_dir, '..', 'database', 'seed.sql')
    
    print("=" * 60)
    print("OpenLedger Black - Database Initialization")
    print("=" * 60)
    
    # Remove existing database if it exists
    if os.path.exists(db_path):
        print(f"🗑️  Removing existing database: {db_path}")
        os.remove(db_path)
    
    # Create database connection
    print(f"🔨 Creating new database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Read and execute schema
        print(f"📋 Loading schema from: {schema_path}")
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        cursor.executescript(schema_sql)
        print("✅ Schema created successfully")
        
        # Read and execute seed data
        print(f"🌱 Loading seed data from: {seed_path}")
        with open(seed_path, 'r', encoding='utf-8') as f:
            seed_sql = f.read()
        cursor.executescript(seed_sql)
        print("✅ Seed data inserted successfully")
        
        # Commit changes
        conn.commit()
        
        # Verify database
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"\n📊 Database Statistics:")
        print(f"   - Users: {user_count}")
        
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        print(f"   - User table columns: {len(columns)}")
        
        # Check for Google OAuth columns
        column_names = [col[1] for col in columns]
        if 'google_sub' in column_names and 'google_picture' in column_names:
            print("   - ✅ Google OAuth columns present")
        else:
            print("   - ⚠️  Google OAuth columns missing!")
        
        print("\n✨ Database initialization complete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error during initialization: {str(e)}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    init_database()
