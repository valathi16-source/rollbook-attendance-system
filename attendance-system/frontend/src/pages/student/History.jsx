import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import client from "../../api/client";
import StatusStamp from "../../components/StatusStamp";

export default function StudentHistory() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/student/subjects").then((res) => setSubjects(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = subjectId ? { subject_id: subjectId } : {};
    client.get("/student/attendance", { params }).then((res) => { setRecords(res.data); setLoading(false); });
  }, [subjectId]);

  return (
    <Layout eyebrow="Student" title="Attendance Log">
      <div className="card">
        <div className="panel-header">
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} style={{ padding: "8px 10px", borderRadius: 3, border: "1px solid var(--rule-strong)" }}>
            <option value="">All subjects</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
          <span className="tag">{records.length} records</span>
        </div>
        {loading ? (
          <div className="panel-body"><div className="spinner" /></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="display">No attendance records</div>
            <div>Nothing has been marked for you yet.</div>
          </div>
        ) : (
          <table className="ledger">
            <thead><tr><th>Date</th><th>Subject</th><th>Status</th><th>Remarks</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.date}</td>
                  <td style={{ fontWeight: 600 }}>{r.subject_name}</td>
                  <td><StatusStamp status={r.status} /></td>
                  <td style={{ color: "var(--text-muted)" }}>{r.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
