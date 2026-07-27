import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import client from "../../api/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/admin/stats").then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <Layout eyebrow="Admin" title="Overview">
      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="grid grid-4" style={{ marginBottom: 22 }}>
            <div className="card stat-card">
              <div className="label">Students</div>
              <div className="value">{stats.total_students}</div>
            </div>
            <div className="card stat-card">
              <div className="label">Teachers</div>
              <div className="value">{stats.total_teachers}</div>
            </div>
            <div className="card stat-card">
              <div className="label">Classes</div>
              <div className="value">{stats.total_classes}</div>
            </div>
            <div className="card stat-card">
              <div className="label">Subjects</div>
              <div className="value">{stats.total_subjects}</div>
            </div>
          </div>

          <div className="card">
            <div className="panel-header">
              <h3 style={{ fontSize: 16 }}>Today's Attendance</h3>
              <span className="tag">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="panel-body">
              {stats.today_attendance_marked === 0 ? (
                <div className="empty-state">
                  <div className="display">No records marked yet today</div>
                  <div>Attendance will appear here once a teacher marks a session.</div>
                </div>
              ) : (
                <div className="grid grid-3">
                  <div>
                    <div className="label" style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Records marked</div>
                    <div className="display" style={{ fontSize: 26 }}>{stats.today_attendance_marked}</div>
                  </div>
                  <div>
                    <div className="label" style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Present</div>
                    <div className="display" style={{ fontSize: 26, color: "var(--present)" }}>{stats.today_present}</div>
                  </div>
                  <div>
                    <div className="label" style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Attendance rate</div>
                    <div className="display" style={{ fontSize: 26 }}>{stats.today_percentage}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
