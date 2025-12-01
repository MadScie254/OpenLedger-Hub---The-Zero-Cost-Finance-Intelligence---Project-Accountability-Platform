import sqlite3

conn = sqlite3.connect('openledger.db')
cursor = conn.cursor()

print("\n" + "="*60)
print("DATABASE PERSISTENCE VERIFICATION")
print("="*60)

print("\n📊 PROJECTS IN DATABASE:\n")
cursor.execute('SELECT id, name, total_budget, status FROM projects ORDER BY id DESC LIMIT 5')
projects = cursor.fetchall()
for row in projects:
    print(f"  [{row[0]}] {row[1]}")
    print(f"      Budget: ${row[2]:,.2f} | Status: {row[3]}")
    print()

print("\n💰 TRANSACTIONS IN DATABASE:\n")
cursor.execute('SELECT id, description, amount, transaction_type, date FROM transactions ORDER BY id DESC LIMIT 5')
transactions = cursor.fetchall()
for row in transactions:
    print(f"  [{row[0]}] {row[1]}")
    print(f"      Amount: ${row[2]:,.2f} | Type: {row[3]} | Date: {row[4]}")
    print()

print("="*60)
print(f"Total Projects: {len(projects)}")
print(f"Total Transactions Shown: {len(transactions)}")
print("="*60 + "\n")

conn.close()
