from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine, SessionLocal

from app.routes.auth_routes import router as auth_router
from app.routes.complaint_routes import router as complaint_router
from app.routes.admin_routes import router as admin_router
from app.routes.officer_routes import router as officer_router
from app.services.routing_service import ensure_default_departments

app = FastAPI()

# CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB tables (won't modify existing ones)
Base.metadata.create_all(bind=engine)

# After creating tables, inspect schema and add missing columns
from sqlalchemy import inspect, text
inspector = inspect(engine)
if inspector.has_table("users"):
    cols = [col["name"] for col in inspector.get_columns("users")]
    if "department_id" not in cols:
        # sqlite supports simple ALTER TABLE ADD COLUMN
        try:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN department_id INTEGER"))
                conn.commit()
        except Exception:
            pass  # column might already exist
    if "created_at" not in cols:
        # Add created_at column - sqlite will handle defaults
        try:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN created_at DATETIME"))
                conn.commit()
        except Exception:
            pass  # column might already exist

if inspector.has_table("complaints"):
    cols = [col["name"] for col in inspector.get_columns("complaints")]
    if "assigned_officer_id" not in cols:
        try:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE complaints ADD COLUMN assigned_officer_id INTEGER"))
                conn.commit()
        except Exception:
            pass  # column might already exist

# Initialize default departments
db = SessionLocal()
try:
    ensure_default_departments(db)
finally:
    db.close()

# Include routers
app.include_router(auth_router)
app.include_router(complaint_router)
app.include_router(admin_router)
app.include_router(officer_router)


@app.get("/")
def root():
    return {"message": "CivicMind AI Backend Running"}
