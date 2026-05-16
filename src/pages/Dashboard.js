import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, beds: 124 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (!u) navigate("/");
      else setUser(u);
    });
    return unsub;
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pSnap = await getDocs(collection(db, "patients"));
        const dSnap = await getDocs(collection(db, "doctors"));
        const aSnap = await getDocs(collection(db, "appointments"));
        const list = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setStats({ patients: pSnap.size, doctors: dSnap.size, appointments: aSnap.size, beds: 124 });
        setRecentPatients(list.slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: "Total Patients", value: stats.patients, icon: "👤", border: "#6366f1", sub: "Registered" },
    { label: "Total Doctors", value: stats.doctors, icon: "👨‍⚕️", border: "#10b981", sub: "Active" },
    { label: "Appointments", value: stats.appointments, icon: "📅", border: "#f59e0b", sub: "Scheduled" },
    { label: "Beds Available", value: stats.beds, icon: "🛏️", border: "#ef4444", sub: "Out of 200" },
  ];

  const statusStyle = (s) => {
    if (s === "Admitted") return { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" };
    if (s === "Discharged") return { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" };
    if (s === "Critical") return { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3" };
    return { bg: "#fffbeb", color: "#92400e", border: "#fde68a" };
  };

  const navItems = [
    { icon: "⊞", label: "Dashboard", path: "/dashboard" },
    { icon: "♡", label: "Patients", path: "/patients" },
    { icon: "✚", label: "Doctors", path: "/doctors" },
    { icon: "◷", label: "Appointments", path: "/appointments" },
    { icon: "◈", label: "Reports", path: "/reports" },
  ];

  const fallback = [
    { patientId: "P-001", name: "Rahul Sharma", department: "Cardiology", doctor: "Dr. Mehta", status: "Admitted" },
    { patientId: "P-002", name: "Priya Singh", department: "Orthopedics", doctor: "Dr. Gupta", status: "Under Treatment" },
    { patientId: "P-003", name: "Amit Kumar", department: "Neurology", doctor: "Dr. Sharma", status: "Discharged" },
  ];

  const tableData = recentPatients.length > 0 ? recentPatients : fallback;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#f9fafb" }}>

      {/* Sidebar */}
      <div style={{ width: 230, background: "#111827", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #1f2937" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🏥</div>
            <div>
              <div style={{ color: "#f9fafb", fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>SwasthSetu</div>
              <div style={{ color: "#6b7280", fontSize: 10, marginTop: 1 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          <p style={{ color: "#4b5563", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px", marginBottom: 8 }}>Menu</p>
          {navItems.map(item => {
            const active = item.path === "/dashboard";
            return (
              <div key={item.label} onClick={() => navigate(item.path)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", marginBottom: 2,
                  cursor: "pointer", borderRadius: 8, fontSize: 13,
                  background: active ? "#1f2937" : "transparent",
                  color: active ? "#f9fafb" : "#6b7280",
                  fontWeight: active ? 600 : 400,
                  borderLeft: active ? "2px solid #f9fafb" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#1f2937"; e.currentTarget.style.color = "#d1d5db"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; } }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ padding: "14px 12px", borderTop: "1px solid #1f2937" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#1f2937", borderRadius: 8, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#f3f4f6", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.email?.split("@")[0] || "Admin"}
              </div>
              <div style={{ color: "#6b7280", fontSize: 10 }}>Administrator</div>
            </div>
          </div>
          <button onClick={() => signOut(auth).then(() => navigate("/"))}
            style={{ width: "100%", padding: "7px 0", background: "transparent", color: "#6b7280", border: "1px solid #374151", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.borderColor = "#ef4444"; e.target.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#374151"; e.target.style.color = "#6b7280"; }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{ background: "white", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {greeting()}, {user?.email?.split("@")[0] || "Admin"} 👋
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{today}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative", cursor: "pointer", color: "#6b7280", fontSize: 18 }}>
              🔔
              <div style={{ position: "absolute", top: -1, right: -1, width: 7, height: 7, background: "#ef4444", borderRadius: "50%", border: "1.5px solid white" }} />
            </div>

            <div style={{ position: "relative" }}>
              <div onClick={() => setShowProfile(!showProfile)}
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#111827", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>

              {showProfile && (
                <div style={{ position: "absolute", right: 0, top: 42, background: "white", borderRadius: 10, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", width: 210, zIndex: 100, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{user?.email?.split("@")[0]}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{user?.email}</div>
                  </div>
                  <div style={{ padding: "6px 0" }}>
                    <div
  onClick={() => navigate("/profile")}
  style={{ padding: "9px 16px", fontSize: 13, color: "#374151", cursor: "pointer" }}
  onMouseEnter={e => e.target.style.background = "#f9fafb"}
  onMouseLeave={e => e.target.style.background = "transparent"}
>
  👤 My Profile
</div>

<div
  onClick={() => navigate("/settings")}
  style={{ padding: "9px 16px", fontSize: 13, color: "#374151", cursor: "pointer" }}
  onMouseEnter={e => e.target.style.background = "#f9fafb"}
  onMouseLeave={e => e.target.style.background = "transparent"}
>
  ⚙️ Settings
</div>
                    <div style={{ height: 1, background: "#e5e7eb", margin: "4px 0" }} />
                    <div style={{ padding: "9px 16px", fontSize: 13, color: "#ef4444", cursor: "pointer" }}
                      onClick={() => signOut(auth).then(() => navigate("/"))}
                      onMouseEnter={e => e.target.style.background = "#fff1f2"}
                      onMouseLeave={e => e.target.style.background = "transparent"}>
                      Sign out
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Dashboard</h1>
            <p style={{ margin: "3px 0 0", color: "#9ca3af", fontSize: 13 }}>Here's what's happening at your hospital today.</p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            {statCards.map(s => (
              <div key={s.label} style={{ background: "white", borderRadius: 10, padding: "18px 20px", border: "1px solid #e5e7eb", borderTop: `3px solid ${s.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{loading ? "—" : s.value}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Recent Table */}
          <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>Recent Admissions</h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>Latest patient records from Firestore</p>
              </div>
              <button onClick={() => navigate("/patients")}
                style={{ padding: "6px 14px", background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                View all
              </button>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading...</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Patient ID", "Name", "Department", "Doctor", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((p, i) => {
                    const st = statusStyle(p.status);
                    return (
                      <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151", fontWeight: 600 }}>{p.patientId}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 600, color: "#111827" }}>{p.name}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: "#6b7280" }}>{p.department}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: "#6b7280" }}>{p.doctor}</td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}