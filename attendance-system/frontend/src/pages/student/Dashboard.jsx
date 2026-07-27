import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import client from "../../api/client";
import PercentRing from "../../components/PercentRing";

export default function StudentDashboard() {
  const [summary, setSummary] = useState(null);
  const [bySubject, setBySubject] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([client.get("/student/summary"), client.get("/student/summary/by-subject")]).then(([s, b]) => {
      setSummary(s.data);
      setBySubject(b.data);
      setLoading(false);
    });
  }, []);

  return (
    <Layout eyebrow="Student" title="Overview">
      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="grid" style={{ gridTemplateColumns: "260px 1fr", marginBottom: 20 }}>
            <div className="card panel-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <PercentRing value={summary.percentage} size={128} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 600 }}>Overall Attendance</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{summary.total_classes} classes held</div>
              </div>
            </div>

            <div className="grid grid-4">
              <div className="card stat-card">
                <div className="label">Present</div>
                <div className="value" style={{ color: "var(--present)" }}>{summary.present}</div>
              </div>
              <div className="card stat-card">
                <div className="label">Absent</div>
                <div className="value" style={{ color: "var(--absent)" }}>{summary.absent}</div>
              </div>
              <div className="card stat-card">
                <div className="label">Late</div>
                <div className="value" style={{ color: "var(--late)" }}>{summary.late}</div>
              </div>
              <div className="card stat-card">
                <div className="label">Excused</div>
                <div className="value" style={{ color: "var(--excused)" }}>{summary.excused}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="panel-header"><h3 style={{ fontSize: 16 }}>By Subject</h3></div>
            {bySubject.length === 0 ? (
              <div className="empty-state">
                <div className="display">No attendance recorded yet</div>
                <div>Your subject-wise attendance will appear here once classes begin.</div>
              </div>
            ) : (
              <table className="ledger">
                <thead><tr><th>Subject</th><th>Classes Held</th><th>Present</th><th>Absent</th><th>Percentage</th></tr></thead>
                <tbody>
                  {bySubject.map((r) => (
                    <tr key={r.subject_id}>
                      <td style={{ fontWeight: 600 }}>{r.subject_name}</td>
                      <td>{r.total_classes}</td>
                      <td>{r.present}</td>
                      <td>{r.absent}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: r.percentage >= 75 ? "var(--present)" : r.percentage >= 50 ? "var(--late)" : "var(--absent)" }}>
                          {r.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
