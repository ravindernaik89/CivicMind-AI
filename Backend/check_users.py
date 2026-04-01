from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User, UserRole
from app.database import engine

print("=== All Registered Users in Database (SQLite: civicmind.db) ===")
print("Note: Citizens registered via /register, Officers via admin, Admins may be external/seeded.")

engine = create_engine("sqlite:///civicmind.db", connect_args={"check_same_thread": False})
Session = sessionmaker(bind=engine)

with Session() as db:
    users = db.query(User).all()
    if not users:
        print("No users found.")
    else:
        for u in users:
            role_str = u.role.value if hasattr(u.role, 'value') else str(u.role)
            dept = u.department_id or 'N/A'
            print(f"ID: {u.id}, Name: {u.name}, Email: {u.email}, Role: {role_str}, Dept ID: {dept}")
    
    print("\n=== Role Counts ===")
    citizens = db.query(User).filter(User.role == UserRole.CITIZEN).count()
    officers = db.query(User).filter(User.role == UserRole.OFFICER).count()
    admins = db.query(User).filter(User.role == UserRole.ADMIN).count()
    print(f"CITIZEN: {citizens}, OFFICER: {officers}, ADMIN: {admins}")

print("\nCurrent DB is SQLite (not PostgreSQL from config). To switch to Postgres:")
print("1. Install psycopg2: pip install psycopg2-binary")
print("2. Create Postgres DB 'civicmind'")
print("3. Update .env DATABASE_URL=postgresql://postgres:password@localhost:5432/civicmind")
print("4. Restart server")
