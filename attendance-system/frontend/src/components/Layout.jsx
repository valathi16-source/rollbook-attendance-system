import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = {
  admin: [
    { to: "/admin", label: "Overview", end: true },
    { to: "/admin/classes", label: "Classes" },
    { to: "/admin/teachers", label: "Teachers" },
    { to: "/admin/students", label: "Students" },
    { to: "/admin/subjects", label: "Subjects" },
    { to: "/admin/reports", label: "Reports" },
  ],
  teacher: [
    { to: "/teacher", label: "My Subjects", end: true },
    { to: "/teacher/mark", label: "Mark Attendance" },
    { to: "/teacher/reports", label: "Class Reports" },
  ],
  student: [
    { to: "/student", label: "Overview", end: true },
    { to: "/student/history", label: "Attendance Log" },
  ],
};

const ROLE_LABEL = { admin: "Administrator", teacher: "Faculty", student: "Student" };

export default function Layout({ title, eyebrow, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV_ITEMS[user?.role] || [];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="mark">Rollbook</div>
          <div className="sub">Attendance Register</div>
        </div>
        <ul className="nav-list">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={({ isActive }) => (isActive ? "active" : "")}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="sidebar-foot">
          <div style={{ fontWeight: 600, color: "#fff", marginBottom: 2 }}>{user?.full_name}</div>
          <div style={{ marginBottom: 10 }}>{ROLE_LABEL[user?.role]}</div>
          <button
            onClick={handleLogout}
            style={{ padding: 0, color: "#e8b4a3", fontWeight: 600, fontSize: 12.5 }}
          >
            Sign out →
          </button>
        </div>
      </aside>
      <div className="main-area">
        <div className="topbar">
          <div>
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            <h1 style={{ fontSize: 24 }}>{title}</h1>
          </div>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
