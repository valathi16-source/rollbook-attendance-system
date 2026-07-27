import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import client, { API_BASE_URL } from "../../api/client";

export default function Reports() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.get("/admin/classes").then((res) => {
      setClasses(res.data);
      if (res.data.length) setClassId(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    const params = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    client.get(`/reports/class/${classId}`, { params }).then((res) => { setRows(res.data); setLoading(false); });
  }, [classId, fromDate, toDate]);

  function exportCsv() {
    const params = new URLSearchParams();
    if (fromDate) params.append("from_date", fromDate);
    if (toDate) params.append("to_date", toDate);
    const token = localStorage.getItem("ams_token");
    fetch(`${API_BASE_URL}/reports/class/${classId}/export-csv?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `class_${classId}_attendance_report.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  return (
    <Layout eyebrow="Admin" title="Reports">
      <div className="card">
        <div className="panel-header" style={{ flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} style={{ padding: "8px 10px", borderRadius: 3, border: "1px solid var(--rule-strong)" }}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
            </select>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ padding: "8px 10px", borderRadius: 3, border: "1px solid var(--rule-strong)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 12.5 }}>to</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ padding: "8px 10px", borderRadius: 3, border: "1px solid var(--rule-strong)" }} />
          </div>
          <button className="btn btn-outline btn-sm" onClick={exportCsv} disabled={!classId}>Export CSV</button>
        </div>

        {loading ? (
          <div className="panel-body"><div className="spinner" /></div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <div className="display">No attendance data for this range</div>
            <div>Try a different class or widen the date range.</div>
          </div>
        ) : (
          <table className="ledger">
            <thead><tr><th>Roll No.</th><th>Student</th><th>Classes Held</th><th>Present</th><th>Attendance %</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student_id}>
                  <td className="mono">{r.roll_number}</td>
                  <td style={{ fontWeight: 600 }}>{r.student_name}</td>
                  <td>{r.total_classes}</td>
                  <td>{r.present}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: r.percentage >= 75 ? "var(--present)" : r.percentage >= 50 ? "var(--late)" : "var(--absent)",
                    }}>
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
