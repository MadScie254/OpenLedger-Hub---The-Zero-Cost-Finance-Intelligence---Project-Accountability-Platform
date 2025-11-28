import sqlite3
import hashlib

# Connect to database
conn = sqlite3.connect('openledger.db')
cursor = conn.cursor()

# Get admin user
users = cursor.execute('SELECT username, password_hash FROM users WHERE username="admin"').fetchall()

print('='*60)
print('DATABASE CHECK')
print('='*60)

if users:
    username, db_hash = users[0]
    print(f'\nUsername in DB: {username}')
    print(f'Hash in DB: {db_hash}')
    
    # Calculate correct hash
    correct_hash = hashlib.sha256('root1234'.encode()).hexdigest()
    print(f'\nExpected hash for "root1234": {correct_hash}')
    print(f'\nHashes match: {db_hash == correct_hash}')
    
    if db_hash != correct_hash:
        print('\n❌ MISMATCH! Updating database...')
        cursor.execute('UPDATE users SET password_hash=? WHERE username="admin"', (correct_hash,))
        conn.commit()
        print('✅ Database updated with correct hash!')
    else:
        print('\n✅ Hash is correct!')
else:
    print('❌ No admin user found!')

conn.close()
