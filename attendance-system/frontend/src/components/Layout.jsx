import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const items = NAV_ITEMS[user?.role] || [];
  const [navOpen, setNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className={`app-shell${navOpen ? " nav-open" : ""}`}>
      <button
        className="nav-scrim"
        aria-label="Close menu"
        tabIndex={navOpen ? 0 : -1}
        onClick={() => setNavOpen(false)}
      />

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
          <div className="sidebar-foot-name">{user?.full_name}</div>
          <div className="sidebar-foot-role">{ROLE_LABEL[user?.role]}</div>
          <button className="sidebar-signout" onClick={handleLogout}>
            Sign out →
          </button>
        </div>
      </aside>

      <div className="main-area">
        <div className="topbar">
          <button
            className="nav-toggle"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {navOpen ? (
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
          <div className="topbar-title">
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            <h1 style={{ fontSize: 24 }}>{title}</h1>
          </div>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
