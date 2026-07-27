import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminClasses from "./pages/admin/Classes";
import AdminTeachers from "./pages/admin/Teachers";
import AdminStudents from "./pages/admin/Students";
import AdminSubjects from "./pages/admin/Subjects";
import AdminReports from "./pages/admin/Reports";

import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherMarkAttendance from "./pages/teacher/MarkAttendance";
import TeacherReports from "./pages/teacher/Reports";

import StudentDashboard from "./pages/student/Dashboard";
import StudentHistory from "./pages/student/History";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/classes" element={<ProtectedRoute roles={["admin"]}><AdminClasses /></ProtectedRoute>} />
          <Route path="/admin/teachers" element={<ProtectedRoute roles={["admin"]}><AdminTeachers /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute roles={["admin"]}><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/subjects" element={<ProtectedRoute roles={["admin"]}><AdminSubjects /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={["admin"]}><AdminReports /></ProtectedRoute>} />

          <Route path="/teacher" element={<ProtectedRoute roles={["teacher"]}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/mark" element={<ProtectedRoute roles={["teacher"]}><TeacherMarkAttendance /></ProtectedRoute>} />
          <Route path="/teacher/reports" element={<ProtectedRoute roles={["teacher"]}><TeacherReports /></ProtectedRoute>} />

          <Route path="/student" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/history" element={<ProtectedRoute roles={["student"]}><StudentHistory /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
