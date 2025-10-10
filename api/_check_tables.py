import sqlite3 as s

with s.connect("employees.db") as c:
    rows = c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    print(rows)
