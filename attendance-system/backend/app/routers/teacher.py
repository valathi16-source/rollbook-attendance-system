from datetime import date as date_type
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import require_roles

router = APIRouter(prefix="/teacher", tags=["Teacher"], dependencies=[Depends(require_roles("teacher"))])


def _get_teacher(db: Session, user: models.User) -> models.Teacher:
    teacher = db.query(models.Teacher).filter_by(user_id=user.id).first()
    if not teacher:
        raise HTTPException(404, "Teacher profile not found")
    return teacher


@router.get("/subjects", response_model=List[schemas.SubjectOut])
def my_subjects(db: Session = Depends(get_db), current_user: models.User = Depends(require_roles("teacher"))):
    teacher = _get_teacher(db, current_user)
    return db.query(models.Subject).filter_by(teacher_id=teacher.id).all()


@router.get("/subjects/{subject_id}/students", response_model=List[schemas.StudentOut])
def students_for_subject(subject_id: int, db: Session = Depends(get_db),
                          current_user: models.User = Depends(require_roles("teacher"))):
    teacher = _get_teacher(db, current_user)
    subject = db.query(models.Subject).get(subject_id)
    if not subject or subject.teacher_id != teacher.id:
        raise HTTPException(403, "Not your subject")
    return db.query(models.Student).filter_by(class_id=subject.class_id).all()


@router.post("/attendance/mark")
def mark_attendance(payload: schemas.AttendanceBulkMark, db: Session = Depends(get_db),
                     current_user: models.User = Depends(require_roles("teacher"))):
    teacher = _get_teacher(db, current_user)
    subject = db.query(models.Subject).get(payload.subject_id)
    if not subject or subject.teacher_id != teacher.id:
        raise HTTPException(403, "Not your subject")

    created, updated = 0, 0
    for rec in payload.records:
        existing = db.query(models.Attendance).filter_by(
            student_id=rec.student_id, subject_id=payload.subject_id, date=payload.date
        ).first()
        if existing:
            existing.status = rec.status
            existing.remarks = rec.remarks
            existing.marked_by = teacher.id
            updated += 1
        else:
            db.add(models.Attendance(
                student_id=rec.student_id,
                subject_id=payload.subject_id,
                date=payload.date,
                status=rec.status,
                remarks=rec.remarks,
                marked_by=teacher.id,
            ))
            created += 1
    db.commit()
    return {"detail": "Attendance recorded", "created": created, "updated": updated}


@router.get("/attendance", response_model=List[schemas.AttendanceDetailOut])
def view_attendance(subject_id: int, date: Optional[date_type] = None, db: Session = Depends(get_db),
                     current_user: models.User = Depends(require_roles("teacher"))):
    teacher = _get_teacher(db, current_user)
    subject = db.query(models.Subject).get(subject_id)
    if not subject or subject.teacher_id != teacher.id:
        raise HTTPException(403, "Not your subject")

    q = db.query(models.Attendance).filter_by(subject_id=subject_id)
    if date:
        q = q.filter(models.Attendance.date == date)
    records = q.all()
    out = []
    for r in records:
        out.append(schemas.AttendanceDetailOut(
            id=r.id, student_id=r.student_id, subject_id=r.subject_id, date=r.date,
            status=r.status, remarks=r.remarks,
            student_name=r.student.user.full_name, roll_number=r.student.roll_number,
            subject_name=r.subject.name,
        ))
    return out


@router.put("/attendance/{attendance_id}", response_model=schemas.AttendanceOut)
def edit_attendance(attendance_id: int, payload: schemas.AttendanceUpdate, db: Session = Depends(get_db),
                     current_user: models.User = Depends(require_roles("teacher"))):
    teacher = _get_teacher(db, current_user)
    record = db.query(models.Attendance).get(attendance_id)
    if not record or record.subject.teacher_id != teacher.id:
        raise HTTPException(404, "Attendance record not found")
    record.status = payload.status
    record.remarks = payload.remarks
    db.commit()
    db.refresh(record)
    return record


@router.get("/reports/subject/{subject_id}", response_model=List[schemas.StudentAttendanceSummary])
def subject_report(subject_id: int, db: Session = Depends(get_db),
                    current_user: models.User = Depends(require_roles("teacher"))):
    teacher = _get_teacher(db, current_user)
    subject = db.query(models.Subject).get(subject_id)
    if not subject or subject.teacher_id != teacher.id:
        raise HTTPException(403, "Not your subject")

    students = db.query(models.Student).filter_by(class_id=subject.class_id).all()
    results = []
    for s in students:
        records = [r for r in s.attendance_records if r.subject_id == subject_id]
        total = len(records)
        present = len([r for r in records if r.status == models.AttendanceStatus.present])
        absent = len([r for r in records if r.status == models.AttendanceStatus.absent])
        late = len([r for r in records if r.status == models.AttendanceStatus.late])
        excused = len([r for r in records if r.status == models.AttendanceStatus.excused])
        pct = round((present / total) * 100, 2) if total else 0.0
        results.append(schemas.StudentAttendanceSummary(
            subject_id=subject_id, subject_name=subject.name, total_classes=total,
            present=present, absent=absent, late=late, excused=excused, percentage=pct,
            student_id=s.id, student_name=s.user.full_name, roll_number=s.roll_number,
        ))
    return results


@router.get("/reports/low-attendance")
def low_attendance_alert(threshold: float = 75.0, db: Session = Depends(get_db),
                          current_user: models.User = Depends(require_roles("teacher"))):
    teacher = _get_teacher(db, current_user)
    subjects = db.query(models.Subject).filter_by(teacher_id=teacher.id).all()
    alerts = []
    for subject in subjects:
        students = db.query(models.Student).filter_by(class_id=subject.class_id).all()
        for s in students:
            records = [r for r in s.attendance_records if r.subject_id == subject.id]
            total = len(records)
            present = len([r for r in records if r.status == models.AttendanceStatus.present])
            pct = round((present / total) * 100, 2) if total else 100.0
            if pct < threshold and total > 0:
                alerts.append({
                    "student_id": s.id, "student_name": s.user.full_name, "roll_number": s.roll_number,
                    "subject_id": subject.id, "subject_name": subject.name, "percentage": pct,
                })
    return alerts
