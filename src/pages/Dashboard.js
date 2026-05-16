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
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();

    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";

    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) {
        navigate("/");
      } else {
        setUser(u);
      }
    });

    return unsub;
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pSnap = await getDocs(collection(db, "patients"));
        const dSnap = await getDocs(collection(db, "doctors"));
        const aSnap = await getDocs(collection(db, "appointments"));

        const list = pSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setStats({
          patients: pSnap.size,
          doctors: dSnap.size,
          appointments: aSnap.size,
          beds: 124,
        });

        setRecentPatients(list.slice(0, 5));
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      label: "Total Patients",
      value: stats.patients,
      icon: "👤",
      border: "#6366f1",
      sub: "Registered",
    },
    {
      label: "Total Doctors",
      value: stats.doctors,
      icon: "👨‍⚕️",
      border: "#10b981",
      sub: "Active",
    },
    {
      label: "Appointments",
      value: stats.appointments,
      icon: "📅",
      border: "#f59e0b",
      sub: "Scheduled",
    },
    {
      label: "Beds Available",
      value: stats.beds,
      icon: "🛏️",
      border: "#ef4444",
      sub: "Out of 200",
    },
  ];

  const statusStyle = (s) => {
    if (s === "Admitted") {
      return {
        bg: "#f0fdf4",
        color: "#166534",
        border: "#bbf7d0",
      };
    }

    if (s === "Discharged") {
      return {
        bg: "#eff6ff",
        color: "#1e40af",
        border: "#bfdbfe",
      };
    }

    return {
      bg: "#fffbeb",
      color: "#92400e",
      border: "#fde68a",
    };
  };

  const navItems = [
    {
      icon: "⊞",
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: "♡",
      label: "Patients",
      path: "/patients",
    },
    {
      icon: "✚",
      label: "Doctors",
      path: "/doctors",
    },
    {
      icon: "◷",
      label: "Appointments",
      path: "/appointments",
    },
    {
      icon: "◈",
      label: "Reports",
      path: "/reports",
    },
  ];

  const fallback = [
    {
      patientId: "P-001",
      name: "Rahul Sharma",
      department: "Cardiology",
      doctor: "Dr. Mehta",
      status: "Admitted",
    },
    {
      patientId: "P-002",
      name: "Priya Singh",
      department: "Orthopedics",
      doctor: "Dr. Gupta",
      status: "Under Treatment",
    },
    {
      patientId: "P-003",
      name: "Amit Kumar",
      department: "Neurology",
      doctor: "Dr. Sharma",
      status: "Discharged",
    },
  ];

  const tableData =
    recentPatients.length > 0 ? recentPatients : fallback;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f9fafb",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 230,
          background: "#111827",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid #1f2937",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#1f2937",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🏥
            </div>

            <div>
              <div
                style={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                SwasthSetu
              </div>

              <div
                style={{
                  color: "#9ca3af",
                  fontSize: 11,
                }}
              >
                Healthcare Admin
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: 12 }}>
          {navItems.map((item) => (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 10,
                cursor: "pointer",
                marginBottom: 8,
                background:
                  item.path === "/dashboard"
                    ? "#1f2937"
                    : "transparent",
                color: "white",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom User */}
        <div
          style={{
            padding: 14,
            borderTop: "1px solid #1f2937",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>

            <div>
              <div
                style={{
                  color: "white",
                  fontSize: 13,
                }}
              >
                {user?.email?.split("@")[0]}
              </div>

              <div
                style={{
                  color: "#9ca3af",
                  fontSize: 11,
                }}
              >
                Administrator
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const confirmLogout = window.confirm(
                "Are you sure you want to logout?"
              );

              if (confirmLogout) {
                signOut(auth).then(() => navigate("/"));
              }
            }}
            style={{
              width: "100%",
              padding: "10px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Topbar */}
        <div
          style={{
            background: "white",
            padding: "16px 28px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {greeting()},{" "}
              {user?.email?.split("@")[0] || "Admin"} 👋
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginTop: 3,
              }}
            >
              {today}
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <div
              onClick={() =>
                setShowProfile(!showProfile)
              }
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#111827",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>

            {showProfile && (
              <div
                style={{
                  position: "absolute",
                  top: 48,
                  right: 0,
                  width: 220,
                  background: "white",
                  borderRadius: 12,
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    padding: 16,
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {user?.email?.split("@")[0]}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginTop: 3,
                    }}
                  >
                    {user?.email}
                  </div>
                </div>

                <div
                  onClick={() =>
                    navigate("/profile")
                  }
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                  }}
                >
                  👤 My Profile
                </div>

                <div
                  onClick={() =>
                    navigate("/settings")
                  }
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                  }}
                >
                  ⚙️ Settings
                </div>

                <div
                  onClick={() => {
                    const confirmLogout =
                      window.confirm(
                        "Are you sure you want to logout?"
                      );

                    if (confirmLogout) {
                      signOut(auth).then(() =>
                        navigate("/")
                      );
                    }
                  }}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    color: "#ef4444",
                    borderTop:
                      "1px solid #e5e7eb",
                  }}
                >
                  🚪 Sign Out
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <div
          style={{
            flex: 1,
            padding: 28,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              color: "#111827",
            }}
          >
            Dashboard
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginTop: 6,
              marginBottom: 28,
            }}
          >
            Here's what's happening today.
          </p>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: 18,
              marginBottom: 28,
            }}
          >
            {statCards.map((s) => (
              <div
                key={s.label}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: 20,
                  border:
                    "1px solid #e5e7eb",
                  borderTop: `4px solid ${s.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span>{s.label}</span>
                  <span>{s.icon}</span>
                </div>

                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {loading ? "—" : s.value}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginTop: 4,
                  }}
                >
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom:
                  "1px solid #e5e7eb",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                  }}
                >
                  Recent Admissions
                </h2>

                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  Latest patient records
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/patients")
                }
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border:
                    "1px solid #d1d5db",
                  background: "#f9fafb",
                  cursor: "pointer",
                }}
              >
                View all
              </button>
            </div>

            {loading ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                }}
              >
                Loading...
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f9fafb",
                    }}
                  >
                    {[
                      "Patient ID",
                      "Name",
                      "Department",
                      "Doctor",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: 14,
                          textAlign: "left",
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {tableData.map((p, i) => {
                    const st = statusStyle(
                      p.status
                    );

                    return (
                      <tr
                        key={i}
                        style={{
                          borderTop:
                            "1px solid #f3f4f6",
                        }}
                      >
                        <td
                          style={{
                            padding: 14,
                          }}
                        >
                          {p.patientId}
                        </td>

                        <td
                          style={{
                            padding: 14,
                            fontWeight: 600,
                          }}
                        >
                          {p.name}
                        </td>

                        <td
                          style={{
                            padding: 14,
                          }}
                        >
                          {p.department}
                        </td>

                        <td
                          style={{
                            padding: 14,
                          }}
                        >
                          {p.doctor}
                        </td>

                        <td
                          style={{
                            padding: 14,
                          }}
                        >
                          <span
                            style={{
                              padding:
                                "4px 10px",
                              borderRadius: 20,
                              background:
                                st.bg,
                              color: st.color,
                              border: `1px solid ${st.border}`,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
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