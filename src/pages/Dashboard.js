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
    { label: "Total Patients", value: stats.patients, icon: "👤", color: "#0ea5e9", light: "#e0f2fe", sub: "Registered" },
    { label: "Total Doctors", value: stats.doctors, icon: "👨‍⚕️", color: "#10b981", light: "#d1fae5", sub: "Active" },
    { label: "Appointments", value: stats.appointments, icon: "📅", color: "#f59e0b", light: "#fef3c7", sub: "Scheduled" },
    { label: "Beds Available", value: stats.beds, icon: "🛏️", color: "#8b5cf6", light: "#ede9fe", sub: "Out of 200" },
  ];

  const statusStyle = (s) => {
    if (s === "Admitted") return { bg: "#dbeafe", color: "#1d4ed8" };
    if (s === "Discharged") return { bg: "#dcfce7", color: "#15803d" };
    if (s === "Critical") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#fef9c3", color: "#b45309" };
  };

  const navItems = [
    { icon: "📊", label: "Dashboard", path: "/dashboard" },
    { icon: "👤", label: "Patients", path: "/patients" },
    { icon: "👨‍⚕️", label: "Doctors", path: "/doctors" },
    { icon: "📅", label: "Appointments", path: "/appointments" },
    { icon: "📋", label: "Reports", path: "/reports" },
  ];

  const fallback = [
    { patientId: "P-001", name: "Rahul Sharma", department: "Cardiology", doctor: "Dr. Mehta", status: "Admitted" },
    { patientId: "P-002", name: "Priya Singh", department: "Orthopedics", doctor: "Dr. Gupta", status: "Under Treatment" },
    { patientId: "P-003", name: "Amit Kumar", department: "Neurology", doctor: "Dr. Sharma", status: "Discharged" },
  ];

  const tableData = recentPatients.length > 0 ? recentPatients : fallback;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#f8fafc" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#0ea5e9", borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏥</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>SwasthSetu</div>
              <div style={{ color: "#475569", fontSize: 10 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "14px 0" }}>
          {navItems.map(item => {
            const active = item.path === "/dashboard";
            return (
              <div key={item.label} onClick={() => navigate(item.path)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", margin: "2px 10px",
                  cursor: "pointer", borderRadius: 8, fontSize: 13,
                  background: active ? "#0ea5e9" : "transparent",
                  color: active ? "white" : "#64748b",
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#1e293b"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div style={{ padding: "14px", borderTop: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#1e293b", borderRadius: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "white", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.email?.split("@")[0] || "Admin"}
              </div>
              <div style={{ color: "#475569", fontSize: 10 }}>Administrator</div>
            </div>
          </div>
          <button onClick={() => signOut(auth).then(() => navigate("/"))}
            style={{ width: "100%", padding: "7px 0", background: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{ background: "white", padding: "13px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
              {greeting()}, <span style={{ color: "#0ea5e9" }}>{user?.email?.split("@")[0] || "Admin"}</span> 👋
            </span>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{today}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", cursor: "pointer", fontSize: 18 }}>
              🔔
              <div style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, background: "#ef4444", borderRadius: "50%", border: "1.5px solid white" }} />
            </div>

            <div style={{ position: "relative" }}>
              <div onClick={() => setShowProfile(!showProfile)}
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#0ea5e9", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>

              {showProfile && (
                <div style={{ position: "absolute", right: 0, top: 42, background: "white", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", width: 200, zIndex: 100, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                  <div style={{ padding: "13px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{user?.email?.split("@")[0]}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{user?.email}</div>
                  </div>
                  <div style={{ padding: "6px 0" }}>
                    {["👤  My Profile", "⚙️  Settings"].map(item => (
                      <div key={item} style={{ padding: "9px 16px", fontSize: 13, color: "#374151", cursor: "pointer" }}
                        onMouseEnter={e => e.target.style.background = "#f8fafc"}
                        onMouseLeave={e => e.target.style.background = "transparent"}>
                        {item}
                      </div>
                    ))}
                    <div style={{ height: 1, background: "#e2e8f0", margin: "4px 0" }} />
                    <div style={{ padding: "9px 16px", fontSize: 13, color: "#ef4444", cursor: "pointer" }}
                      onClick={() => signOut(auth).then(() => navigate("/"))}
                      onMouseEnter={e => e.target.style.background = "#fef2f2"}
                      onMouseLeave={e => e.target.style.background = "transparent"}>
                      🚪  Sign out
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "22px 26px", overflowY: "auto" }}>
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#0f172a" }}>Dashboard Overview</h1>
            <p style={{ margin: "3px 0 0", color: "#94a3b8", fontSize: 13 }}>Here's what's happening at your hospital today.</p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
            {statCards.map(s => (
              <div key={s.label} style={{ background: "white", borderRadius: 10, padding: "16px 18px", border: "1px solid #e2e8f0", cursor: "default" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                  <div style={{ background: s.light, borderRadius: 7, padding: "4px 6px", fontSize: 15 }}>{s.icon}</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{loading ? "..." : s.value}</div>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Recent Table */}
          <div style={{ background: "white", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "15px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Recent Admissions</h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>Latest patient records</p>
              </div>
              <button onClick={() => navigate("/patients")}
                style={{ padding: "6px 14px", background: "#f1f5f9", color: "#0ea5e9", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                View all →
              </button>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading...</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Patient ID", "Name", "Department", "Doctor", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((p, i) => {
                    const st = statusStyle(p.status);
                    return (
                      <tr key={i} style={{ borderTop: "1px solid #f8fafc" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: "#0ea5e9", fontWeight: 700 }}>{p.patientId}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{p.name}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{p.department}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{p.doctor}</td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>
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