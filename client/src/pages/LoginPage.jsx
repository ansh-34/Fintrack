import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const QUICK_LOGINS = [
  { label: "Admin", email: "admin@fintrack.com", password: "admin123" },
  { label: "Analyst", email: "analyst@fintrack.com", password: "analyst123" },
  { label: "Viewer", email: "viewer@fintrack.com", password: "viewer123" },
];

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = async (creds) => {
    setError("");
    setSubmitting(true);
    try {
      await login(creds.email, creds.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>FinTrack</h1>
        <p className="subtitle">{isRegister ? "Create your account" : "Sign in to your account"}</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
        </form>

        <div style={{ textAlign: "center", margin: "1rem 0", fontSize: "0.85rem" }}>
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: "none", border: "none", color: "#e94560", cursor: "pointer" }}
          >
            {isRegister ? "Already have an account? Login" : "Need an account? Register"}
          </button>
        </div>

        <div className="quick-login">
          <p>Quick login (demo accounts)</p>
          {QUICK_LOGINS.map((c) => (
            <button key={c.label} onClick={() => quickLogin(c)} disabled={submitting}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
