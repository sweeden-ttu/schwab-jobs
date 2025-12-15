
import sqlite3

def read_jobs():
    conn = sqlite3.connect('schwab_jobs.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT title, description, qualifications FROM jobs')
    jobs = cursor.fetchall()
    conn.close()
    return jobs

if __name__ == '__main__':
    jobs = read_jobs()
    for job in jobs:
        print(f"Title: {job['title']}")
        print(f"Description: {job['description']}")
        print(f"Qualifications: {job['qualifications']}")
        print("-" * 20)
