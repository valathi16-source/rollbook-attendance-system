import csv
import io
from datetime import date as date_type
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.deps import require_roles

router = APIRouter(prefix="/reports", tags=["Reports"], dependencies=[Depends(require_roles("admin"))])


@router.get("/class/{class_id}")
def class_report(class_id: int, from_date: Optional[date_type] = None, to_date: Optional[date_type] = None,
                  db: Session = Depends(get_db)):
    students = db.query(models.Student).filter_by(class_id=class_id).all()
    results = []
    for s in students:
        records = s.attendance_records
        if from_date:
            records = [r for r in records if r.date >= from_date]
        if to_date:
            records = [r for r in records if r.date <= to_date]
        total = len(records)
        present = len([r for r in records if r.status == models.AttendanceStatus.present])
        pct = round((present / total) * 100, 2) if total else 0.0
        results.append({
            "student_id": s.id, "roll_number": s.roll_number, "student_name": s.user.full_name,
            "total_classes": total, "present": present, "percentage": pct,
        })
    return results


@router.get("/class/{class_id}/export-csv")
def export_class_csv(class_id: int, from_date: Optional[date_type] = None, to_date: Optional[date_type] = None,
                      db: Session = Depends(get_db)):
    students = db.query(models.Student).filter_by(class_id=class_id).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Roll Number", "Student Name", "Total Classes", "Present", "Absent", "Late", "Excused", "Percentage"])
    for s in students:
        records = s.attendance_records
        if from_date:
            records = [r for r in records if r.date >= from_date]
        if to_date:
            records = [r for r in records if r.date <= to_date]
        total = len(records)
        present = len([r for r in records if r.status == models.AttendanceStatus.present])
        absent = len([r for r in records if r.status == models.AttendanceStatus.absent])
        late = len([r for r in records if r.status == models.AttendanceStatus.late])
        excused = len([r for r in records if r.status == models.AttendanceStatus.excused])
        pct = round((present / total) * 100, 2) if total else 0.0
        writer.writerow([s.roll_number, s.user.full_name, total, present, absent, late, excused, pct])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=class_{class_id}_attendance_report.csv"},
    )


@router.get("/student/{student_id}")
def student_report(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).get(student_id)
    if not student:
        return {"detail": "Student not found"}
    by_subject = {}
    for r in student.attendance_records:
        key = r.subject_id
        if key not in by_subject:
            by_subject[key] = {"subject_name": r.subject.name, "total": 0, "present": 0}
        by_subject[key]["total"] += 1
        if r.status == models.AttendanceStatus.present:
            by_subject[key]["present"] += 1
    result = []
    for k, v in by_subject.items():
        pct = round((v["present"] / v["total"]) * 100, 2) if v["total"] else 0.0
        result.append({"subject_id": k, "subject_name": v["subject_name"], "total": v["total"],
                        "present": v["present"], "percentage": pct})
    return result
