import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout";
import client from "../../api/client";

export default function TeacherReports() {
  const [params, setParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState(params.get("subject") || "");
  const [rows, setRows] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/teacher/subjects").then((res) => {
      setSubjects(res.data);
      if (!subjectId && res.data.length) setSubjectId(String(res.data[0].id));
    });
    client.get("/teacher/reports/low-attendance", { params: { threshold: 75 } }).then((res) => setAlerts(res.data));
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    setParams({ subject: subjectId });
    client.get(`/teacher/reports/subject/${subjectId}`).then((res) => { setRows(res.data); setLoading(false); });
  }, [subjectId]);

  return (
    <Layout eyebrow="Faculty" title="Class Reports">
      {alerts.length > 0 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="panel-header"><h3 style={{ fontSize: 15 }}>Below 75% Attendance</h3><span className="tag">{alerts.length}</span></div>
          <table className="ledger">
            <thead><tr><th>Roll No.</th><th>Student</th><th>Subject</th><th>Percentage</th></tr></thead>
            <tbody>
              {alerts.map((a, i) => (
                <tr key={i}>
                  <td className="mono">{a.roll_number}</td>
                  <td style={{ fontWeight: 600 }}>{a.student_name}</td>
                  <td>{a.subject_name}</td>
                  <td style={{ color: "var(--absent)", fontWeight: 700 }}>{a.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="panel-header">
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} style={{ padding: "8px 10px", borderRadius: 3, border: "1px solid var(--rule-strong)" }}>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>
        {loading ? (
          <div className="panel-body"><div className="spinner" /></div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <div className="display">No attendance recorded yet</div>
            <div>Mark attendance for this subject to see the report here.</div>
          </div>
        ) : (
          <table className="ledger">
            <thead><tr><th>Roll No.</th><th>Student</th><th>Classes Held</th><th>Present</th><th>Absent</th><th>Late</th><th>Excused</th><th>Percentage</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="mono">{r.roll_number}</td>
                  <td style={{ fontWeight: 600 }}>{r.student_name}</td>
                  <td>{r.total_classes}</td>
                  <td>{r.present}</td>
                  <td>{r.absent}</td>
                  <td>{r.late}</td>
                  <td>{r.excused}</td>
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
    </Layout>
  );
}
