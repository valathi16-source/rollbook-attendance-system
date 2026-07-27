import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, SessionLocal
from app import models
from app.auth import get_password_hash
from app.routers import auth, admin, teacher, student, reports

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Attendance Management System", version="1.0.0")

# Comma-separated list, e.g. "https://myapp.vercel.app,http://localhost:5173"
_origins_env = os.environ.get("CORS_ORIGINS", "*")
allow_origins = ["*"] if _origins_env.strip() == "*" else [o.strip() for o in _origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(teacher.router)
app.include_router(student.router)
app.include_router(reports.router)


@app.on_event("startup")
def seed_default_admin():
    """Create a default admin account on first run so there's always a way in."""
    db = SessionLocal()
    try:
        existing = db.query(models.User).filter_by(role=models.RoleEnum.admin).first()
        if not existing:
            default_password = os.environ.get("DEFAULT_ADMIN_PASSWORD", "admin123")
            admin_user = models.User(
                full_name="System Administrator",
                username="admin",
                email="admin@school.local",
                hashed_password=get_password_hash(default_password),
                role=models.RoleEnum.admin,
            )
            db.add(admin_user)
            db.commit()
            print(f"Seeded default admin -> username: admin | password: {default_password}")
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Attendance Management System API is running", "docs": "/docs"}
