import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    beds: 124,
  });
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      if (!u) navigate("/");
      else setUser(u);
    });
    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pSnap = await getDocs(collection(db, "patients"));
        const dSnap = await getDocs(collection(db, "doctors"));
        const aSnap = await getDocs(collection(db, "appointments"));
        const patientList = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setStats({
          patients: pSnap.size,
          doctors: dSnap.size,
          appointments: aSnap.size,
          beds: 124,
        });
        setRecentPatients(patientList.slice(0, 5));
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: "Total Patients", value: stats.patients || "—", icon: "🏥", color: "#0ea5e9", bg: "#e0f2fe" },
    { label: "Total Doctors", value: stats.doctors || "—", icon: "👨‍⚕️", color: "#10b981", bg: "#d1fae5" },
    { label: "Appointments Today", value: stats.appointments || "—", icon: "📅", color: "#f59e0b", bg: "#fef3c7" },
    { label: "Beds Available", value: stats.beds, icon: "🛏️", color: "#8b5cf6", bg: "#ede9fe" },
  ];

  const statusColor = (status) => {
    if (status === "Admitted") return { bg: "#dbeafe", color: "#1d4ed8" };
    if (status === "Discharged") return { bg: "#dcfce7", color: "#15803d" };
    if (status === "Critical") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#fef9c3", color: "#b45309" };
  };

  const navItems = [
    { icon: "📊", label: "Dashboard", path: "/dashboard" },
    { icon: "👤", label: "Patients", path: "/patients" },
    { icon: "👨‍⚕️", label: "Doctors", path: "/doctors" },
    { icon: "📅", label: "Appointments", path: "/appointments" },
    { icon: "📋", label: "Reports", path: "/reports" },
  ];

  // Fallback static data if Firestore is empty
  const tableData = recentPatients.length > 0 ? recentPatients : [
    { patientId: "P-001", name: "Rahul Sharma", department: "Cardiology", doctor: "Dr. Mehta", status: "Admitted" },
    { patientId: "P-002", name: "Priya Singh", department: "Orthopedics", doctor: "Dr. Gupta", status: "Under Treatment" },
    { patientId: "P-003", name: "Amit Kumar", department: "Neurology", doctor: "Dr. Sharma", status: "Discharged" },
    { patientId: "P-004", name: "Sunita Devi", department: "Gynecology", doctor: "Dr. Patel", status: "Admitted" },
    { patientId: "P-005", name: "Rajesh Verma", department: "General", doctor: "Dr. Joshi", status: "Under Treatment" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#f1f5f9" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: "#0f172a", color: "white", padding: "24px 0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "white" }}>SwasthSetu</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Admin Panel</div>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          {navItems.map(item => (
            <div key={item.label} onClick={() => navigate(item.path)}
              style={{
                padding: "10px 20px", cursor: "pointer", display: "flex",
                alignItems: "center", gap: 10, fontSize: 14,
                background: item.path === "/dashboard" ? "#0ea5e9" : "transparent",
                color: item.path === "/dashboard" ? "white" : "#94a3b8",
                borderRadius: item.path === "/dashboard" ? "0 8px 8px 0" : 0,
                marginRight: 12, transition: "all 0.2s",
              }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #1e293b" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>{user?.email}</div>
          <button onClick={() => signOut(auth).then(() => navigate("/"))}
            style={{ width: "100%", padding: "8px 0", background: "#ef4444", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top Bar */}
        <div style={{ background: "white", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <span style={{ fontSize: 14, color: "#64748b" }}>👋 Welcome back, </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              {user?.email?.split("@")[0] || "Admin"}
            </span>
          </div>

          {/* Profile Icon */}
          <div style={{ position: "relative" }}>
            <div onClick={() => setShowProfile(!showProfile)}
              style={{ width: 38, height: 38, borderRadius: "50%", background: "#0ea5e9", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, cursor: "pointer", userSelect: "none" }}>
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>

            {/* Dropdown */}
            {showProfile && (
              <div style={{ position: "absolute", right: 0, top: 46, background: "white", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "8px 0", width: 200, zIndex: 100 }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                    {user?.email?.split("@")[0] || "Admin"}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{user?.email}</div>
                </div>
                <div style={{ padding: "8px 0" }}>
                  <div style={{ padding: "8px 16px", fontSize: 13, color: "#374151", cursor: "pointer" }}
                    onMouseEnter={e => e.target.style.background = "#f8fafc"}
                    onMouseLeave={e => e.target.style.background = "transparent"}>
                    👤 My Profile
                  </div>
                  <div style={{ padding: "8px 16px", fontSize: 13, color: "#374151", cursor: "pointer" }}
                    onMouseEnter={e => e.target.style.background = "#f8fafc"}
                    onMouseLeave={e => e.target.style.background = "transparent"}>
                    ⚙️ Settings
                  </div>
                  <div style={{ padding: "8px 16px", fontSize: 13, color: "#ef4444", cursor: "pointer", borderTop: "1px solid #f1f5f9", marginTop: 4 }}
                    onClick={() => signOut(auth).then(() => navigate("/"))}
                    onMouseEnter={e => e.target.style.background = "#fef2f2"}
                    onMouseLeave={e => e.target.style.background = "transparent"}>
                    🚪 Logout
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "28px 32px" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Dashboard Overview</h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Here's what's happening at your hospital today.</p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28 }}>
            {statCards.map(stat => (
              <div key={stat.label} style={{ background: "white", borderRadius: 12, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${stat.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
                    <p style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0f172a" }}>{stat.value}</p>
                  </div>
                  <div style={{ background: stat.bg, borderRadius: 10, padding: "8px", fontSize: 24 }}>{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Table */}
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Recent Patient Admissions</h2>
              <button onClick={() => navigate("/patients")}
                style={{ padding: "6px 14px", background: "#eff6ff", color: "#0ea5e9", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                View All →
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Patient ID", "Name", "Department", "Doctor", "Status"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((p, i) => (
                  <tr key={i}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}>
                    <td style={{ padding: "14px 16px", fontSize: 14, color: "#0ea5e9", fontWeight: 600 }}>{p.patientId}</td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{p.name}</td>
                    <td style={{ padding: "14px 16px", fontSize: 14, color: "#64748b" }}>{p.department}</td>
                    <td style={{ padding: "14px 16px", fontSize: 14, color: "#64748b" }}>{p.doctor}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, ...statusColor(p.status) }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}