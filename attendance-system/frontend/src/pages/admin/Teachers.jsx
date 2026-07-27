import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import client from "../../api/client";

const BLANK = { full_name: "", username: "", email: "", password: "", employee_code: "", department: "" };

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    client.get("/admin/teachers").then((res) => { setTeachers(res.data); setLoading(false); });
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await client.post("/admin/teachers", form);
      setForm(BLANK);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create teacher");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this teacher account?")) return;
    await client.delete(`/admin/teachers/${id}`);
    load();
  }

  return (
    <Layout eyebrow="Admin" title="Teachers">
      <div className="grid" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
        <div className="card">
          <div className="panel-header">
            <h3 style={{ fontSize: 16 }}>Faculty</h3>
            <span className="tag">{teachers.length} total</span>
          </div>
          {loading ? (
            <div className="panel-body"><div className="spinner" /></div>
          ) : teachers.length === 0 ? (
            <div className="empty-state">
              <div className="display">No teachers yet</div>
              <div>Add a faculty account using the form.</div>
            </div>
          ) : (
            <table className="ledger">
              <thead><tr><th>Name</th><th>Employee Code</th><th>Department</th><th>Username</th><th></th></tr></thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.user.full_name}</td>
                    <td className="mono">{t.employee_code}</td>
                    <td>{t.department || "—"}</td>
                    <td className="mono">{t.user.username}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card panel-body">
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Add Teacher</h3>
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
              <label>Employee Code</label>
              <input value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} required />
            </div>
            <div className="field">
              <label>Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Add Teacher</button>
        </form>
      </div>
    </Layout>
  );
}
