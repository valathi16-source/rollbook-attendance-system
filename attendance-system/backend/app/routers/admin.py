from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.auth import get_password_hash
from app.deps import require_roles

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_roles("admin"))])


# ---------------- Classes ----------------
@router.post("/classes", response_model=schemas.ClassRoomOut)
def create_class(payload: schemas.ClassRoomCreate, db: Session = Depends(get_db)):
    existing = db.query(models.ClassRoom).filter_by(name=payload.name, section=payload.section).first()
    if existing:
        raise HTTPException(400, "Class with this name/section already exists")
    cls = models.ClassRoom(**payload.model_dump())
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return cls


@router.get("/classes", response_model=List[schemas.ClassRoomOut])
def list_classes(db: Session = Depends(get_db)):
    return db.query(models.ClassRoom).all()


@router.put("/classes/{class_id}", response_model=schemas.ClassRoomOut)
def update_class(class_id: int, payload: schemas.ClassRoomCreate, db: Session = Depends(get_db)):
    cls = db.query(models.ClassRoom).get(class_id)
    if not cls:
        raise HTTPException(404, "Class not found")
    for k, v in payload.model_dump().items():
        setattr(cls, k, v)
    db.commit()
    db.refresh(cls)
    return cls


@router.delete("/classes/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db)):
    cls = db.query(models.ClassRoom).get(class_id)
    if not cls:
        raise HTTPException(404, "Class not found")
    db.delete(cls)
    db.commit()
    return {"detail": "Class deleted"}


# ---------------- Teachers ----------------
@router.post("/teachers", response_model=schemas.TeacherOut)
def create_teacher(payload: schemas.TeacherCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=payload.username).first():
        raise HTTPException(400, "Username already taken")
    if db.query(models.User).filter_by(email=payload.email).first():
        raise HTTPException(400, "Email already registered")
    if db.query(models.Teacher).filter_by(employee_code=payload.employee_code).first():
        raise HTTPException(400, "Employee code already exists")

    user = models.User(
        full_name=payload.full_name,
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=models.RoleEnum.teacher,
    )
    db.add(user)
    db.flush()

    teacher = models.Teacher(
        user_id=user.id,
        employee_code=payload.employee_code,
        department=payload.department,
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.get("/teachers", response_model=List[schemas.TeacherOut])
def list_teachers(db: Session = Depends(get_db)):
    return db.query(models.Teacher).all()


@router.delete("/teachers/{teacher_id}")
def delete_teacher(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(models.Teacher).get(teacher_id)
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    user = db.query(models.User).get(teacher.user_id)
    db.delete(teacher)
    if user:
        db.delete(user)
    db.commit()
    return {"detail": "Teacher deleted"}


# ---------------- Students ----------------
@router.post("/students", response_model=schemas.StudentOut)
def create_student(payload: schemas.StudentCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=payload.username).first():
        raise HTTPException(400, "Username already taken")
    if db.query(models.User).filter_by(email=payload.email).first():
        raise HTTPException(400, "Email already registered")
    if db.query(models.Student).filter_by(roll_number=payload.roll_number).first():
        raise HTTPException(400, "Roll number already exists")

    user = models.User(
        full_name=payload.full_name,
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=models.RoleEnum.student,
    )
    db.add(user)
    db.flush()

    student = models.Student(
        user_id=user.id,
        roll_number=payload.roll_number,
        class_id=payload.class_id,
        guardian_name=payload.guardian_name,
        guardian_phone=payload.guardian_phone,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("/students", response_model=List[schemas.StudentOut])
def list_students(class_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Student)
    if class_id:
        q = q.filter(models.Student.class_id == class_id)
    return q.all()


@router.put("/students/{student_id}", response_model=schemas.StudentOut)
def update_student(student_id: int, payload: schemas.StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(models.Student).get(student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    data = payload.model_dump(exclude_unset=True)
    if "is_active" in data:
        student.user.is_active = data.pop("is_active")
    for k, v in data.items():
        setattr(student, k, v)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).get(student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    user = db.query(models.User).get(student.user_id)
    db.delete(student)
    if user:
        db.delete(user)
    db.commit()
    return {"detail": "Student deleted"}


# ---------------- Subjects ----------------
@router.post("/subjects", response_model=schemas.SubjectOut)
def create_subject(payload: schemas.SubjectCreate, db: Session = Depends(get_db)):
    if db.query(models.Subject).filter_by(code=payload.code).first():
        raise HTTPException(400, "Subject code already exists")
    subject = models.Subject(**payload.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.get("/subjects", response_model=List[schemas.SubjectOut])
def list_subjects(class_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Subject)
    if class_id:
        q = q.filter(models.Subject.class_id == class_id)
    return q.all()


@router.put("/subjects/{subject_id}", response_model=schemas.SubjectOut)
def update_subject(subject_id: int, payload: schemas.SubjectCreate, db: Session = Depends(get_db)):
    subject = db.query(models.Subject).get(subject_id)
    if not subject:
        raise HTTPException(404, "Subject not found")
    for k, v in payload.model_dump().items():
        setattr(subject, k, v)
    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = db.query(models.Subject).get(subject_id)
    if not subject:
        raise HTTPException(404, "Subject not found")
    db.delete(subject)
    db.commit()
    return {"detail": "Subject deleted"}


# ---------------- Dashboard stats ----------------
@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    total_students = db.query(func.count(models.Student.id)).scalar()
    total_teachers = db.query(func.count(models.Teacher.id)).scalar()
    total_classes = db.query(func.count(models.ClassRoom.id)).scalar()
    total_subjects = db.query(func.count(models.Subject.id)).scalar()

    today_records = db.query(models.Attendance).filter(
        models.Attendance.date == func.current_date()
    ).all()
    today_present = len([r for r in today_records if r.status == models.AttendanceStatus.present])
    today_total = len(today_records)
    today_percentage = round((today_present / today_total) * 100, 2) if today_total else 0

    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_classes": total_classes,
        "total_subjects": total_subjects,
        "today_attendance_marked": today_total,
        "today_present": today_present,
        "today_percentage": today_percentage,
    }
