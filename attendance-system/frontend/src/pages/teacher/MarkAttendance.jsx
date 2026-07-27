import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout";
import client from "../../api/client";
import { StampButton } from "../../components/StatusStamp";

const STATUSES = ["present", "absent", "late", "excused"];
const today = () => new Date().toISOString().slice(0, 10);

export default function MarkAttendance() {
  const [params, setParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState(params.get("subject") || "");
  const [date, setDate] = useState(today());
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    client.get("/teacher/subjects").then((res) => {
      setSubjects(res.data);
      if (!subjectId && res.data.length) setSubjectId(String(res.data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    setMessage("");
    setParams({ subject: subjectId });
    Promise.all([
      client.get(`/teacher/subjects/${subjectId}/students`),
      client.get("/teacher/attendance", { params: { subject_id: subjectId, date } }),
    ]).then(([studentsRes, attRes]) => {
      setStudents(studentsRes.data);
      const initMarks = {};
      const initRemarks = {};
      attRes.data.forEach((r) => { initMarks[r.student_id] = r.status; initRemarks[r.student_id] = r.remarks || ""; });
      studentsRes.data.forEach((s) => { if (!initMarks[s.id]) initMarks[s.id] = "present"; });
      setMarks(initMarks);
      setRemarks(initRemarks);
      setLoading(false);
    });
  }, [subjectId, date]);

  function setAll(status) {
    const next = {};
    students.forEach((s) => (next[s.id] = status));
    setMarks(next);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const records = students.map((s) => ({ student_id: s.id, status: marks[s.id] || "present", remarks: remarks[s.id] || null }));
    try {
      await client.post("/teacher/attendance/mark", { subject_id: Number(subjectId), date, records });
      setMessage("Attendance saved successfully.");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Could not save attendance.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout eyebrow="Faculty" title="Mark Attendance">
      <div className="card">
        <div className="panel-header" style={{ flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} style={{ padding: "8px 10px", borderRadius: 3, border: "1px solid var(--rule-strong)" }}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={today()} style={{ padding: "8px 10px", borderRadius: 3, border: "1px solid var(--rule-strong)" }} />
          </div>
          {students.length > 0 && (
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center", marginRight: 4 }}>Mark all:</span>
              {STATUSES.map((st) => (
                <button key={st} className="btn btn-sm btn-outline" onClick={() => setAll(st)} style={{ textTransform: "capitalize" }}>{st}</button>
              ))}
            </div>
          )}
        </div>

        {message && (
          <div className="panel-body" style={{ paddingBottom: 0 }}>
            <div className={`alert ${message.includes("success") ? "alert-success" : "alert-error"}`}>{message}</div>
          </div>
        )}

        {loading ? (
          <div className="panel-body"><div className="spinner" /></div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="display">No students in this class</div>
            <div>Students need to be assigned to this subject's class first.</div>
          </div>
        ) : (
          <>
            <table className="ledger">
              <thead><tr><th>Roll No.</th><th>Student</th><th>Status</th><th>Remarks</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="mono">{s.roll_number}</td>
                    <td style={{ fontWeight: 600 }}>{s.user.full_name}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {STATUSES.map((st) => (
                          <StampButton key={st} status={st} active={marks[s.id] === st} onClick={() => setMarks({ ...marks, [s.id]: st })} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <input
                        placeholder="optional"
                        value={remarks[s.id] || ""}
                        onChange={(e) => setRemarks({ ...remarks, [s.id]: e.target.value })}
                        style={{ padding: "6px 9px", borderRadius: 3, border: "1px solid var(--rule-strong)", width: 160 }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="panel-body" style={{ paddingTop: 16, borderTop: "1px solid var(--rule)" }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : `Save Attendance for ${date}`}
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
