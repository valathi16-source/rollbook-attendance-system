from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

from app.models import RoleEnum, AttendanceStatus


# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    user_id: int


class LoginRequest(BaseModel):
    username: str
    password: str


# ---------- User ----------
class UserBase(BaseModel):
    full_name: str
    username: str
    email: str


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    role: RoleEnum
    is_active: bool


# ---------- ClassRoom ----------
class ClassRoomCreate(BaseModel):
    name: str
    section: str
    class_teacher_id: Optional[int] = None


class ClassRoomOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    section: str
    class_teacher_id: Optional[int] = None


# ---------- Teacher ----------
class TeacherCreate(BaseModel):
    full_name: str
    username: str
    email: str
    password: str
    employee_code: str
    department: Optional[str] = None


class TeacherOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    employee_code: str
    department: Optional[str] = None
    user: UserOut


# ---------- Student ----------
class StudentCreate(BaseModel):
    full_name: str
    username: str
    email: str
    password: str
    roll_number: str
    class_id: Optional[int] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None


class StudentUpdate(BaseModel):
    class_id: Optional[int] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    is_active: Optional[bool] = None


class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    roll_number: str
    class_id: Optional[int] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    user: UserOut


# ---------- Subject ----------
class SubjectCreate(BaseModel):
    name: str
    code: str
    class_id: int
    teacher_id: Optional[int] = None


class SubjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    code: str
    class_id: int
    teacher_id: Optional[int] = None


# ---------- Attendance ----------
class AttendanceMarkItem(BaseModel):
    student_id: int
    status: AttendanceStatus
    remarks: Optional[str] = None


class AttendanceBulkMark(BaseModel):
    subject_id: int
    date: date
    records: List[AttendanceMarkItem]


class AttendanceUpdate(BaseModel):
    status: AttendanceStatus
    remarks: Optional[str] = None


class AttendanceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    student_id: int
    subject_id: int
    date: date
    status: AttendanceStatus
    remarks: Optional[str] = None


class AttendanceDetailOut(AttendanceOut):
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    subject_name: Optional[str] = None


class StudentAttendanceSummary(BaseModel):
    subject_id: int
    subject_name: str
    total_classes: int
    present: int
    absent: int
    late: int
    excused: int
    percentage: float
    student_id: Optional[int] = None
    student_name: Optional[str] = None
    roll_number: Optional[str] = None


class OverallSummary(BaseModel):
    total_classes: int
    present: int
    absent: int
    late: int
    excused: int
    percentage: float
