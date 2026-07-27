import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import client from "../../api/client";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ name: "", section: "", class_teacher_id: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([client.get("/admin/classes"), client.get("/admin/teachers")]).then(([c, t]) => {
      setClasses(c.data);
      setTeachers(t.data);
      setLoading(false);
    });
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await client.post("/admin/classes", {
        name: form.name,
        section: form.section,
        class_teacher_id: form.class_teacher_id ? Number(form.class_teacher_id) : null,
      });
      setForm({ name: "", section: "", class_teacher_id: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create class");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this class? Students assigned to it will be unassigned.")) return;
    await client.delete(`/admin/classes/${id}`);
    load();
  }

  const teacherName = (id) => teachers.find((t) => t.id === id)?.user.full_name || "—";

  return (
    <Layout eyebrow="Admin" title="Classes">
      <div className="grid" style={{ gridTemplateColumns: "1fr 320px", alignItems: "start" }}>
        <div className="card">
          <div className="panel-header">
            <h3 style={{ fontSize: 16 }}>All Classes</h3>
            <span className="tag">{classes.length} total</span>
          </div>
          {loading ? (
            <div className="panel-body"><div className="spinner" /></div>
          ) : classes.length === 0 ? (
            <div className="empty-state">
              <div className="display">No classes yet</div>
              <div>Create your first class using the form.</div>
            </div>
          ) : (
            <table className="ledger">
              <thead>
                <tr><th>Class</th><th>Section</th><th>Class Teacher</th><th></th></tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.section}</td>
                    <td>{teacherName(c.class_teacher_id)}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card panel-body">
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Add Class</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="field">
            <label>Class Name</label>
            <input placeholder="e.g. Grade 10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Section</label>
            <input placeholder="e.g. A" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} required />
          </div>
          <div className="field">
            <label>Class Teacher (optional)</label>
            <select value={form.class_teacher_id} onChange={(e) => setForm({ ...form, class_teacher_id: e.target.value })}>
              <option value="">— None —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.user.full_name}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Add Class</button>
        </form>
      </div>
    </Layout>
  );
}
