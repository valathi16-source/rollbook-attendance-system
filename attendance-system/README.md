# Rollbook — Student Attendance Management System

A full-stack attendance system for schools/colleges with three roles: **Admin**, **Teacher**, and **Student**.

## Stack
- **Backend:** FastAPI + SQLAlchemy + SQLite + JWT auth
- **Frontend:** React (Vite) + React Router + Axios

## Features
- **Admin:** manage classes, teachers, students, subjects; dashboard stats; class-wise reports with CSV export
- **Teacher:** view assigned subjects, mark/edit attendance per class per day, per-subject reports, low-attendance (<75%) alerts
- **Student:** overall attendance %, present/absent/late/excused breakdown, per-subject summary, full attendance log
- JWT-based login with role-based access control on every endpoint

---

## 1. Run the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows (PowerShell: venv\Scripts\Activate.ps1)
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at **http://127.0.0.1:8000** (interactive docs at `/docs`).

On first run it auto-creates `attendance.db` (SQLite) and seeds a default admin:

```
username: admin
password: admin123
```

**Change this password / delete the seed logic before using this in production.**

## 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at **http://localhost:5173**. It talks to the backend at `http://127.0.0.1:8000` —
if you run the backend on a different host/port, update `API_BASE_URL` in
`frontend/src/api/client.js`.

## 3. Try it out

1. Log in as `admin` / `admin123`.
2. Create a **Class** (e.g. "Grade 10", section "A").
3. Create a **Teacher** account.
4. Create a **Subject**, assigning it to the class and the teacher.
5. Create a few **Student** accounts assigned to that class.
6. Log out, log back in as the teacher, and mark attendance for today.
7. Log out, log back in as a student to see their attendance summary.

## Project structure

```
backend/
  app/
    main.py          # FastAPI app, CORS, startup seed
    models.py         # SQLAlchemy models
    schemas.py         # Pydantic request/response schemas
    auth.py            # password hashing + JWT
    deps.py             # auth dependency / role guard
    routers/
      auth.py          # /auth/login, /auth/me
      admin.py         # classes, teachers, students, subjects CRUD, stats
      teacher.py       # subjects, mark/edit attendance, reports
      student.py       # own attendance, summaries
      reports.py       # admin-wide class reports + CSV export
  requirements.txt

frontend/
  src/
    api/client.js       # axios instance + auth interceptor
    context/AuthContext.jsx
    components/         # Layout, ProtectedRoute, StatusStamp, PercentRing
    pages/
      Login.jsx
      admin/             # Dashboard, Classes, Teachers, Students, Subjects, Reports
      teacher/           # Dashboard, MarkAttendance, Reports
      student/           # Dashboard, History
```

## Notes / things to change for production
- `SECRET_KEY` in `backend/app/auth.py` is hardcoded — move to an environment variable.
- CORS is wide open (`allow_origins=["*"]`) — restrict to your actual frontend origin.
- Email format isn't strictly validated so you can use test/local addresses freely during development.
- SQLite is fine for learning/small deployments; swap the `SQLALCHEMY_DATABASE_URL` in
  `backend/app/database.py` for Postgres/MySQL when you outgrow it.
