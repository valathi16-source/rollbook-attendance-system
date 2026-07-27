import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(username, password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper)",
      }}
    >
      <div style={{ width: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div className="display" style={{ fontSize: 30, fontWeight: 600 }}>
            Rollbook
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 4 }}>
            Attendance Register
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card panel-body">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--rule)", fontSize: 12, color: "var(--text-muted)" }}>
          </div>
        </form>
      </div>
    </div>
  );
}
