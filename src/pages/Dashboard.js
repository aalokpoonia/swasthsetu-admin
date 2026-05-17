import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
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
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
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
        const list = pSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setStats({ patients: pSnap.size, doctors: dSnap.size, appointments: aSnap.size, beds: 124 });
        setRecentPatients(list.slice(0, 5));
      } catch (e) { console.log(e); }
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
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Sidebar */}
      <div style={{ width: 230, background: "#111827", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #1f2937" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1f2937", border: "1px solid #374151", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏥</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>SwasthSetu</div>
              <div style={{ color: "#6b7280", fontSize: 10 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px" }}>
          <p style={{ color: "#4b5563", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px", marginBottom: 8 }}>Menu</p>
          {navItems.map((item) => {
            const active = item.path === "/dashboard";
            return (
              <div key={item.label} onClick={() => navigate(item.path)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", marginBottom: 2, cursor: "pointer", borderRadius: 8, fontSize: 13, background: active ? "#1f2937" : "transparent", color: active ? "#f9fafb" : "#6b7280", fontWeight: active ? 600 : 400, borderLeft: active ? "2px solid #10b981" : "2px solid transparent" }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#1f2937"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div style={{ padding: "14px 12px", borderTop: "1px solid #1f2937" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#1f2937", borderRadius: 8, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <div style={{ color: "#f3f4f6", fontSize: 12, fontWeight: 600 }}>{user?.email?.split("@")[0] || "Admin"}</div>
              <div style={{ color: "#6b7280", fontSize: 10 }}>Administrator</div>
            </div>
          </div>
          <button onClick={() => { if (window.confirm("Are you sure you want to logout?")) signOut(auth).then(() => navigate("/")); }}
            style={{ width: "100%", padding: "7px 0", background: "transparent", color: "#6b7280", border: "1px solid #374151", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
            onMouseEnter={e => { e.target.style.borderColor = "#ef4444"; e.target.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#374151"; e.target.style.color = "#6b7280"; }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{ background: "white", padding: "14px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {greeting()}, {user?.email?.split("@")[0] || "Admin"} 👋
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{today}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
           {/* Notification Bell */}
<div style={{ position: "relative" }}>

  <div
    onClick={() => setShowNotif(!showNotif)}
    style={{ position: "relative", cursor: "pointer" }}
  >
    <span style={{ fontSize: 20 }}>🔔</span>

    <div
      style={{
        position: "absolute",
        top: -4,
        right: -4,
        width: 18,
        height: 18,
        background: "#ef4444",
        borderRadius: "50%",
        border: "2px solid white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        fontWeight: 700,
        color: "white",
      }}
    >
      3
    </div>
  </div>

  {showNotif && (
    <div
      style={{
        position: "absolute",
        top: 44,
        right: 0,
        width: 300,
        background: "white",
        borderRadius: 10,
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb",
        zIndex: 100,
        overflow: "hidden",
      }}
    >

      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "#111827",
          }}
        >
          Notifications
        </span>

        <span
          style={{
            fontSize: 11,
            color: "#10b981",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <div
  onClick={() => alert("Opening all notifications...")}
  style={{
    padding: "10px 16px",
    textAlign: "center",
    fontSize: 12,
    color: "#10b981",
    fontWeight: 600,
    cursor: "pointer"
  }}
>
  <div
  onClick={() => alert("All notifications marked as read")}
  style={{
    padding: "10px 16px",
    textAlign: "center",
    fontSize: 12,
    color: "#10b981",
    fontWeight: 600,
    cursor: "pointer",
    borderBottom: "1px solid #f3f4f6"
  }}
>
  Mark all read
</div>
  View all notifications
</div>
        </span>
      </div>

      {[
        {
          icon: "👤",
          title: "New patient admitted",
          desc: "Rahul Sharma — Cardiology",
          time: "2 min ago",
        },
        {
          icon: "📅",
          title: "Appointment scheduled",
          desc: "Dr. Mehta — 3:00 PM today",
          time: "15 min ago",
        },
        {
          icon: "👨‍⚕️",
          title: "New doctor registered",
          desc: "Dr. Priya Singh — Neurology",
          time: "1 hr ago",
        },
      ].map((n, i) => (
        <div
          key={i}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            gap: 12,
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#f9fafb")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "white")
          }
        >

          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {n.icon}
          </div>

          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#111827",
              }}
            >
              {n.title}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginTop: 2,
              }}
            >
              {n.desc}
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#9ca3af",
                marginTop: 3,
              }}
            >
              {n.time}
            </div>
          </div>
        </div>
      ))}

      <div
        style={{
          padding: "10px 16px",
          textAlign: "center",
          fontSize: 12,
          color: "#10b981",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        View all notifications
      </div>

    </div>
  )}
</div>
            {/* Profile Avatar */}
            <div style={{ position: "relative" }}>
              <div onClick={() => setShowProfile(!showProfile)}
                style={{ width: 36, height: 36, borderRadius: "50%", background: "#111827", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>

              {showProfile && (
                <div style={{ position: "absolute", top: 44, right: 0, width: 210, background: "white", borderRadius: 10, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb", overflow: "hidden", zIndex: 100 }}>
                  <div style={{ padding: "14px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{user?.email?.split("@")[0]}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{user?.email}</div>
                  </div>
                  <div style={{ padding: "6px 0" }}>
                    <div style={{ padding: "10px 16px", fontSize: 13, color: "#374151", cursor: "pointer" }}
                      onClick={() => { setShowProfile(false); navigate("/profile"); }}
                      onMouseEnter={e => e.target.style.background = "#f9fafb"}
                      onMouseLeave={e => e.target.style.background = "transparent"}>
                      👤  My Profile
                    </div>
                    <div style={{ padding: "10px 16px", fontSize: 13, color: "#374151", cursor: "pointer" }}
                      onClick={() => { setShowProfile(false); navigate("/settings"); }}
                      onMouseEnter={e => e.target.style.background = "#f9fafb"}
                      onMouseLeave={e => e.target.style.background = "transparent"}>
                      ⚙️  Settings
                    </div>
                    <div style={{ height: 1, background: "#e5e7eb", margin: "4px 0" }} />
                    <div style={{ padding: "10px 16px", fontSize: 13, color: "#ef4444", cursor: "pointer" }}
                      onClick={() => { if (window.confirm("Logout?")) signOut(auth).then(() => navigate("/")); }}
                      onMouseEnter={e => e.target.style.background = "#fff1f2"}
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
        <div style={{ flex: 1, padding: 28 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>Dashboard</h1>
          <p style={{ color: "#9ca3af", marginTop: 4, marginBottom: 24, fontSize: 13 }}>Here's what's happening at your hospital today.</p>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            {statCards.map((s) => (
              <div key={s.label} style={{ background: "white", borderRadius: 10, padding: "18px 20px", border: "1px solid #e5e7eb", borderTop: `3px solid ${s.border}` }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{loading ? "—" : s.value}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Recent Admissions</h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>Latest patient records</p>
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
                    {["Patient ID", "Name", "Department", "Doctor", "Status"].map((h) => (
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
                        <td style={{ padding: "13px 16px", fontSize: 13, color: "#10b981", fontWeight: 700 }}>{p.patientId}</td>
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