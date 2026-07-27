import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import client from "../../api/client";

const BLANK = { name: "", code: "", class_id: "", teacher_id: "" };

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([client.get("/admin/subjects"), client.get("/admin/classes"), client.get("/admin/teachers")]).then(
      ([s, c, t]) => { setSubjects(s.data); setClasses(c.data); setTeachers(t.data); setLoading(false); }
    );
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await client.post("/admin/subjects", {
        ...form,
        class_id: Number(form.class_id),
        teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
      });
      setForm(BLANK);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create subject");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this subject? All related attendance records will be deleted.")) return;
    await client.delete(`/admin/subjects/${id}`);
    load();
  }

  const className = (id) => { const c = classes.find((c) => c.id === id); return c ? `${c.name} - ${c.section}` : "—"; };
  const teacherName = (id) => teachers.find((t) => t.id === id)?.user.full_name || "Unassigned";

  return (
    <Layout eyebrow="Admin" title="Subjects">
      <div className="grid" style={{ gridTemplateColumns: "1fr 320px", alignItems: "start" }}>
        <div className="card">
          <div className="panel-header">
            <h3 style={{ fontSize: 16 }}>Subjects</h3>
            <span className="tag">{subjects.length} total</span>
          </div>
          {loading ? (
            <div className="panel-body"><div className="spinner" /></div>
          ) : subjects.length === 0 ? (
            <div className="empty-state">
              <div className="display">No subjects yet</div>
              <div>Create a subject and assign a teacher.</div>
            </div>
          ) : (
            <table className="ledger">
              <thead><tr><th>Subject</th><th>Code</th><th>Class</th><th>Teacher</th><th></th></tr></thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td className="mono">{s.code}</td>
                    <td>{className(s.class_id)}</td>
                    <td>{teacherName(s.teacher_id)}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card panel-body">
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Add Subject</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="field">
            <label>Subject Name</label>
            <input placeholder="e.g. Mathematics" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Subject Code</label>
            <input placeholder="e.g. MATH10A" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </div>
          <div className="field">
            <label>Class</label>
            <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} required>
              <option value="">Select a class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Teacher</label>
            <select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}>
              <option value="">— Unassigned —</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.full_name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Add Subject</button>
        </form>
      </div>
    </Layout>
  );
}
