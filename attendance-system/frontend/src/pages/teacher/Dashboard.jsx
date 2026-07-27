import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import client from "../../api/client";

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    Promise.all([
      client.get("/teacher/subjects"),
      client.get("/teacher/reports/low-attendance", { params: { threshold: 75 } }),
    ]).then(([s, a]) => {
      setSubjects(s.data);
      setAlerts(a.data);
      setLoading(false);
    });
  }, []);

  return (
    <Layout eyebrow="Faculty" title="My Subjects">
      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          {alerts.length > 0 && (
            <div className="alert alert-error" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{alerts.length} student(s) are below 75% attendance across your subjects.</span>
              <Link to="/teacher/reports" style={{ fontWeight: 700, textDecoration: "underline" }}>View report →</Link>
            </div>
          )}

          {subjects.length === 0 ? (
            <div className="card empty-state">
              <div className="display">No subjects assigned yet</div>
              <div>Ask an administrator to assign a subject to your account.</div>
            </div>
          ) : (
            <div className="grid grid-3">
              {subjects.map((s) => (
                <div key={s.id} className="card panel-body">
                  <div className="tag" style={{ marginBottom: 10 }}>{s.code}</div>
                  <h3 style={{ fontSize: 18, marginBottom: 16 }}>{s.name}</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link to={`/teacher/mark?subject=${s.id}`} className="btn btn-primary btn-sm">Mark Attendance</Link>
                    <Link to={`/teacher/reports?subject=${s.id}`} className="btn btn-outline btn-sm">Report</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
