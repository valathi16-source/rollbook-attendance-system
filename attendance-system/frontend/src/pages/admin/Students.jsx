import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import client from "../../api/client";

const BLANK = {
  full_name: "", username: "", email: "", password: "",
  roll_number: "", class_id: "", guardian_name: "", guardian_phone: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const params = filterClass ? { class_id: filterClass } : {};
    Promise.all([client.get("/admin/students", { params }), client.get("/admin/classes")]).then(([s, c]) => {
      setStudents(s.data);
      setClasses(c.data);
      setLoading(false);
    });
  }
  useEffect(load, [filterClass]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await client.post("/admin/students", { ...form, class_id: form.class_id ? Number(form.class_id) : null });
      setForm(BLANK);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create student");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this student account? All attendance history will be deleted.")) return;
    await client.delete(`/admin/students/${id}`);
    load();
  }

  const className = (id) => {
    const c = classes.find((c) => c.id === id);
    return c ? `${c.name} - ${c.section}` : "Unassigned";
  };

  return (
    <Layout eyebrow="Admin" title="Students">
      <div className="grid" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
        <div className="card">
          <div className="panel-header">
            <h3 style={{ fontSize: 16 }}>Students</h3>
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} style={{ padding: "6px 10px", borderRadius: 3, border: "1px solid var(--rule-strong)" }}>
              <option value="">All classes</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
            </select>
          </div>
          {loading ? (
            <div className="panel-body"><div className="spinner" /></div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div className="display">No students found</div>
              <div>Add a student using the form.</div>
            </div>
          ) : (
            <table className="ledger">
              <thead><tr><th>Roll No.</th><th>Name</th><th>Class</th><th>Guardian</th><th></th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="mono">{s.roll_number}</td>
                    <td style={{ fontWeight: 600 }}>{s.user.full_name}</td>
                    <td>{className(s.class_id)}</td>
                    <td>{s.guardian_name || "—"}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card panel-body">
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Add Student</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="field">
            <label>Full Name</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Username</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
          </div>
          <div className="field">
            <label>Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Roll Number</label>
              <input value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} required />
            </div>
            <div className="field">
              <label>Class</label>
              <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
                <option value="">— None —</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Guardian Name</label>
              <input value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} />
            </div>
            <div className="field">
              <label>Guardian Phone</label>
              <input value={form.guardian_phone} onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Add Student</button>
        </form>
      </div>
    </Layout>
  );
}
