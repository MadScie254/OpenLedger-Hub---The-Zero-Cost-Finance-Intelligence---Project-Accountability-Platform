"""
Quick fix script to verify and test login
"""

import sqlite3
import bcrypt
import os

# Connect to database
db_path = os.path.join(os.path.dirname(__file__), 'openledger.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=" * 60)
print("OpenLedger Black - Login Fix")
print("=" * 60)

# Check if admin user exists
cursor.execute("SELECT id, username, email FROM users WHERE username = 'admin'")
admin = cursor.fetchone()

if admin:
    print(f"✅ Admin user exists: ID={admin[0]}, Username={admin[1]}, Email={admin[2]}")
    
    # Update password to root1234
    password_hash = bcrypt.hashpw(b'root1234', bcrypt.gensalt()).decode('utf-8')
    cursor.execute("UPDATE users SET password_hash = ? WHERE username = 'admin'", (password_hash,))
    conn.commit()
    print("✅ Password reset to 'root1234'")
else:
    print("❌ Admin user NOT found")
    print("Creating admin user...")
    
    password_hash = bcrypt.hashpw(b'root1234', bcrypt.gensalt()).decode('utf-8')
    cursor.execute("""
        INSERT INTO users (username, email, password_hash, full_name, role, created_at)
        VALUES ('admin', 'admin@openledger.local', ?, 'System Administrator', 'admin', datetime('now'))
    """, (password_hash,))
    conn.commit()
    print("✅ Admin user created with password 'root1234'")

# Verify
cursor.execute("SELECT id, username, email, role FROM users WHERE username = 'admin'")
result = cursor.fetchone()
print(f"\n📊 Final check:")
print(f"   - ID: {result[0]}")
print(f"   - Username: {result[1]}")
print(f"   - Email: {result[2]}")
print(f"   - Role: {result[3]}")
print(f"\n✨ Login credentials: admin / root1234")
print("=" * 60)

conn.close()
