import sqlite3
import os

db_path = 'prisma/dev.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables:", [t[0] for t in tables])

if 'Deadline' in [t[0] for t in tables]:
    print("Deadline table exists")
    cursor.execute("PRAGMA table_info(Deadline)")
    print("Deadline schema:", cursor.fetchall())
else:
    print("Deadline table MISSING")

cursor.execute("PRAGMA table_info(Task)")
print("Task schema:", cursor.fetchall())

conn.close()
