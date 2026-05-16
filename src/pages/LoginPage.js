import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Incorrect email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Left Panel */}
      <div style={{ width: "42%", background: "#0f172a", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "44px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.02)" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 52 }}>
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏥</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 17 }}>SwasthSetu</div>
              <div style={{ color: "#475569", fontSize: 11 }}>Healthcare Management</div>
            </div>
          </div>

          <h1 style={{ color: "white", fontSize: 30, fontWeight: 700, lineHeight: 1.35, margin: "0 0 14px", letterSpacing: "-0.5px" }}>
            Manage your hospital<br />from one place.
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.75, margin: 0, maxWidth: 320 }}>
            Track patients, doctors, appointments and daily hospital operations — all in one clean admin panel.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {[
            { icon: "👤", text: "Patient records with real-time updates" },
            { icon: "👨‍⚕️", text: "Doctor management and scheduling" },
            { icon: "📅", text: "Appointment tracking and status" },
            { icon: "📊", text: "Analytics and reports dashboard" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ color: "#94a3b8", fontSize: 13 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ color: "#1e293b", fontSize: 11, margin: 0 }}>© 2026 SwasthSetu · For authorized personnel only</p>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{ width: "100%", maxWidth: 390 }}>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.4px" }}>Sign in to your account</h2>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Enter your credentials to access the admin panel.</p>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 7 }}>Email address</label>
              <input
                type="email"
                placeholder="admin@swasthsetu.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none", background: "white", color: "#0f172a" }}
                onFocus={e => e.target.style.borderColor = "#0f172a"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div style={{ marginBottom: 26 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 7 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ width: "100%", padding: "11px 44px 11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none", background: "white", color: "#0f172a" }}
                  onFocus={e => e.target.style.borderColor = "#0f172a"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8" }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "12px 0", background: loading ? "#94a3b8" : "#0f172a", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 28, fontSize: 12, color: "#94a3b8" }}>
            SwasthSetu v1.0 · Restricted access only
          </p>
        </div>
      </div>
    </div>
  );
}