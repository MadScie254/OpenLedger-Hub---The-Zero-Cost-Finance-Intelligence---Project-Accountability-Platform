"""
Database Migration Script: Add Google OAuth Support

Adds Google OAuth columns to users table:
- google_sub: Google's unique user identifier
- google_picture: URL to profile picture
- last_login: Timestamp of last authentication
- updated_at: Timestamp of last profile update

Run this script once to migrate existing database.
Usage: python backend/scripts/migrate_google_oauth.py
"""

import sqlite3
import os
from datetime import datetime


def migrate_database():
    """Add Google OAuth columns to users table"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), '..', '..', 'openledger.db')
    
    print(f"🔄 Migrating database: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        migrations_needed = []
        
        # Check each column
        if 'google_sub' not in columns:
            migrations_needed.append(
                "ALTER TABLE users ADD COLUMN google_sub VARCHAR(255) UNIQUE"
            )
        
        if 'google_picture' not in columns:
            migrations_needed.append(
                "ALTER TABLE users ADD COLUMN google_picture TEXT"
            )
        
        if 'last_login' not in columns:
            migrations_needed.append(
                "ALTER TABLE users ADD COLUMN last_login TIMESTAMP"
            )
        
        if 'updated_at' not in columns:
            migrations_needed.append(
                "ALTER TABLE users ADD COLUMN updated_at TIMESTAMP"
            )
        
        if not migrations_needed:
            print("✅ Database already up to date. No migrations needed.")
            return
        
        # Execute migrations
        for i, migration in enumerate(migrations_needed, 1):
            print(f"   [{i}/{len(migrations_needed)}] Executing: {migration}")
            cursor.execute(migration)
        
        # Create index on google_sub for fast lookups
        try:
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub)")
            print("   [+] Created index on google_sub")
        except sqlite3.OperationalError:
            print("   [i] Index already exists")
        
        # Commit changes
        conn.commit()
        print(f"✅ Successfully applied {len(migrations_needed)} migration(s)")
        
        # Show updated schema
        cursor.execute("PRAGMA table_info(users)")
        print("\n📋 Updated users table schema:")
        for column in cursor.fetchall():
            print(f"   - {column[1]}: {column[2]}")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {str(e)}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("OpenLedger Black - Database Migration: Google OAuth Support")
    print("=" * 60)
    migrate_database()
    print("\n✨ Migration complete!")
