from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base

# Force SQLite
sqlite_url = "sqlite:///civicmind.db"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=engine)
print("SQLite tables created successfully in civicmind.db.")
