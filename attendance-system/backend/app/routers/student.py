from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import require_roles

router = APIRouter(prefix="/student", tags=["Student"], dependencies=[Depends(require_roles("student"))])


def _get_student(db: Session, user: models.User) -> models.Student:
    student = db.query(models.Student).filter_by(user_id=user.id).first()
    if not student:
        raise HTTPException(404, "Student profile not found")
    return student


@router.get("/me", response_model=schemas.StudentOut)
def my_profile(db: Session = Depends(get_db), current_user: models.User = Depends(require_roles("student"))):
    return _get_student(db, current_user)


@router.get("/subjects", response_model=List[schemas.SubjectOut])
def my_subjects(db: Session = Depends(get_db), current_user: models.User = Depends(require_roles("student"))):
    student = _get_student(db, current_user)
    if not student.class_id:
        return []
    return db.query(models.Subject).filter_by(class_id=student.class_id).all()


@router.get("/attendance", response_model=List[schemas.AttendanceDetailOut])
def my_attendance(subject_id: int | None = None, db: Session = Depends(get_db),
                   current_user: models.User = Depends(require_roles("student"))):
    student = _get_student(db, current_user)
    q = db.query(models.Attendance).filter_by(student_id=student.id)
    if subject_id:
        q = q.filter(models.Attendance.subject_id == subject_id)
    records = q.order_by(models.Attendance.date.desc()).all()
    return [
        schemas.AttendanceDetailOut(
            id=r.id, student_id=r.student_id, subject_id=r.subject_id, date=r.date,
            status=r.status, remarks=r.remarks,
            student_name=current_user.full_name, roll_number=student.roll_number,
            subject_name=r.subject.name,
        ) for r in records
    ]


@router.get("/summary", response_model=schemas.OverallSummary)
def my_summary(db: Session = Depends(get_db), current_user: models.User = Depends(require_roles("student"))):
    student = _get_student(db, current_user)
    records = student.attendance_records
    total = len(records)
    present = len([r for r in records if r.status == models.AttendanceStatus.present])
    absent = len([r for r in records if r.status == models.AttendanceStatus.absent])
    late = len([r for r in records if r.status == models.AttendanceStatus.late])
    excused = len([r for r in records if r.status == models.AttendanceStatus.excused])
    pct = round((present / total) * 100, 2) if total else 0.0
    return schemas.OverallSummary(
        total_classes=total, present=present, absent=absent, late=late, excused=excused, percentage=pct
    )


@router.get("/summary/by-subject", response_model=List[schemas.StudentAttendanceSummary])
def my_summary_by_subject(db: Session = Depends(get_db),
                           current_user: models.User = Depends(require_roles("student"))):
    student = _get_student(db, current_user)
    if not student.class_id:
        return []
    subjects = db.query(models.Subject).filter_by(class_id=student.class_id).all()
    results = []
    for subject in subjects:
        records = [r for r in student.attendance_records if r.subject_id == subject.id]
        total = len(records)
        present = len([r for r in records if r.status == models.AttendanceStatus.present])
        absent = len([r for r in records if r.status == models.AttendanceStatus.absent])
        late = len([r for r in records if r.status == models.AttendanceStatus.late])
        excused = len([r for r in records if r.status == models.AttendanceStatus.excused])
        pct = round((present / total) * 100, 2) if total else 0.0
        results.append(schemas.StudentAttendanceSummary(
            subject_id=subject.id, subject_name=subject.name, total_classes=total,
            present=present, absent=absent, late=late, excused=excused, percentage=pct,
        ))
    return results
