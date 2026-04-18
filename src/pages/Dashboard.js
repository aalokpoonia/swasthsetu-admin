import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      if (!u) navigate("/");
      else setUser(u);
    });
    return unsubscribe;
  }, [navigate]);

  const stats = [
    { label: "Total Patients", value: "1,284", icon: "🏥", color: "#0ea5e9" },
    { label: "Total Doctors", value: "48", icon: "👨‍⚕️", color: "#10b981" },
    { label: "Appointments Today", value: "36", icon: "📅", color: "#f59e0b" },
    { label: "Beds Available", value: "124", icon: "🛏️", color: "#8b5cf6" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif", background: "#f1f5f9" }}>
      
      {/* Sidebar */}
      <div style={{ width: 240, background: "#0f172a", color: "white", padding: "24px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ fontSize: 24 }}>🏥</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>SwasthSetu</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Admin Panel</div>
        </div>
        
        {[
          { icon: "📊", label: "Dashboard", path: "/dashboard", active: true },
          { icon: "👤", label: "Patients", path: "/patients" },
          { icon: "👨‍⚕️", label: "Doctors", path: "/doctors" },
          { icon: "📅", label: "Appointments", path: "/appointments" },
          { icon: "📋", label: "Reports", path: "/reports" },
        ].map(item => (
          <div key={item.label} onClick={() => navigate(item.path)}
            style={{ padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 14,
              background: item.active ? "#0ea5e9" : "transparent",
              color: item.active ? "white" : "#94a3b8",
              margin: "2px 8px", borderRadius: 8 }}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "1px solid #1e293b" }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{user?.email}</div>
          <button onClick={() => signOut(auth).then(() => navigate("/"))}
            style={{ width: "100%", padding: "8px 0", background: "#dc2626", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 32 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Dashboard Overview</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
          {stats.map(stat => (
            <div key={stat.label} style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{stat.label}</p>
                  <p style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 700, color: "#0f172a" }}>{stat.value}</p>
                </div>
                <div style={{ fontSize: 36 }}>{stat.icon}</div>
              </div>
              <div style={{ marginTop: 12, height: 4, background: "#f1f5f9", borderRadius: 99 }}>
                <div style={{ height: 4, background: stat.color, borderRadius: 99, width: "70%" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Table */}
        <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Recent Patient Admissions</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                {["Patient ID", "Name", "Department", "Doctor", "Status"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 13, color: "#64748b", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { id: "P-001", name: "Rahul Sharma", dept: "Cardiology", doctor: "Dr. Mehta", status: "Admitted" },
                { id: "P-002", name: "Priya Singh", dept: "Orthopedics", doctor: "Dr. Gupta", status: "Under Treatment" },
                { id: "P-003", name: "Amit Kumar", dept: "Neurology", doctor: "Dr. Sharma", status: "Discharged" },
                { id: "P-004", name: "Sunita Devi", dept: "Gynecology", doctor: "Dr. Patel", status: "Admitted" },
                { id: "P-005", name: "Rajesh Verma", dept: "General", doctor: "Dr. Joshi", status: "Under Treatment" },
              ].map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "12px", fontSize: 14, color: "#0ea5e9", fontWeight: 600 }}>{p.id}</td>
                  <td style={{ padding: "12px", fontSize: 14, color: "#0f172a" }}>{p.name}</td>
                  <td style={{ padding: "12px", fontSize: 14, color: "#64748b" }}>{p.dept}</td>
                  <td style={{ padding: "12px", fontSize: 14, color: "#64748b" }}>{p.doctor}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                      background: p.status === "Admitted" ? "#dbeafe" : p.status === "Discharged" ? "#d1fae5" : "#fef3c7",
                      color: p.status === "Admitted" ? "#1d4ed8" : p.status === "Discharged" ? "#065f46" : "#92400e"
                    }}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
