import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

const Reports = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    admitted: 0,
    underTreatment: 0,
    discharged: 0,
    critical: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    departments: {},
  });
  const [loading, setLoading] = useState(true);

  const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Patients', icon: '👤', path: '/patients' },
    { label: 'Doctors', icon: '👨‍⚕️', path: '/doctors' },
    { label: 'Appointments', icon: '📅', path: '/appointments' },
    { label: 'Reports', icon: '📋', path: '/reports' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch patients
        const pSnap = await getDocs(collection(db, 'patients'));
        const patients = pSnap.docs.map(d => d.data());

        // Fetch doctors
        const dSnap = await getDocs(collection(db, 'doctors'));

        // Fetch appointments
        const aSnap = await getDocs(collection(db, 'appointments'));
        const appointments = aSnap.docs.map(d => d.data());

        // Department count
        const deptCount = {};
        patients.forEach(p => {
          if (p.department) {
            deptCount[p.department] = (deptCount[p.department] || 0) + 1;
          }
        });

        setStats({
          totalPatients: pSnap.size,
          totalDoctors: dSnap.size,
          totalAppointments: aSnap.size,
          admitted: patients.filter(p => p.status === 'Admitted').length,
          underTreatment: patients.filter(p => p.status === 'Under Treatment').length,
          discharged: patients.filter(p => p.status === 'Discharged').length,
          critical: patients.filter(p => p.status === 'Critical').length,
          scheduled: appointments.filter(a => a.status === 'Scheduled').length,
          completed: appointments.filter(a => a.status === 'Completed').length,
          cancelled: appointments.filter(a => a.status === 'Cancelled').length,
          departments: deptCount,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => { await signOut(auth); navigate('/'); };

  const StatCard = ({ title, value, color, icon }) => (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: '600' }}>{title}</p>
        <p style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', margin: '4px 0 0' }}>{value}</p>
      </div>
      <div style={{ fontSize: '36px' }}>{icon}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: color, borderRadius: '0 0 12px 12px' }} />
    </div>
  );

  const maxDept = Math.max(...Object.values(stats.departments), 1);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f1f5f9' }}>
      {/* Sidebar */}
      <div style={{ width: '210px', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1e293b' }}>
          <p style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>SwasthSetu</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map((item) => (
            <div key={item.label}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', background: item.path === '/reports' ? '#0ea5e9' : 'transparent', color: item.path === '/reports' ? 'white' : '#94a3b8', borderRadius: item.path === '/reports' ? '0 8px 8px 0' : 0, marginRight: '12px' }}
              onClick={() => navigate(item.path)}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b' }}>
          <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>{auth.currentUser?.email}</p>
          <button style={{ width: '100%', padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }} onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* Main */}
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Reports & Analytics</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Real-time data from Firestore</p>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>⏳ Loading reports...</div>
        ) : (
          <>
            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
              {[
                { title: 'Total Patients', value: stats.totalPatients, color: '#0ea5e9', icon: '👤' },
                { title: 'Total Doctors', value: stats.totalDoctors, color: '#10b981', icon: '👨‍⚕️' },
                { title: 'Total Appointments', value: stats.totalAppointments, color: '#f59e0b', icon: '📅' },
              ].map((s) => (
                <div key={s.title} style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: '600' }}>{s.title}</p>
                      <p style={{ fontSize: '36px', fontWeight: '700', color: '#0f172a', margin: '4px 0 0' }}>{s.value}</p>
                    </div>
                    <span style={{ fontSize: '40px' }}>{s.icon}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: s.color }} />
                </div>
              ))}
            </div>

            {/* Patient Status + Appointment Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
              {/* Patient Status */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>Patient Status Breakdown</h2>
                {[
                  { label: 'Admitted', value: stats.admitted, color: '#3b82f6' },
                  { label: 'Under Treatment', value: stats.underTreatment, color: '#f59e0b' },
                  { label: 'Discharged', value: stats.discharged, color: '#10b981' },
                  { label: 'Critical', value: stats.critical, color: '#ef4444' },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{item.value}</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${stats.totalPatients ? (item.value / stats.totalPatients) * 100 : 0}%`, background: item.color, borderRadius: '4px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Appointment Status */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>Appointment Status</h2>
                {[
                  { label: 'Scheduled', value: stats.scheduled, color: '#3b82f6' },
                  { label: 'Completed', value: stats.completed, color: '#10b981' },
                  { label: 'Cancelled', value: stats.cancelled, color: '#ef4444' },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{item.value}</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${stats.totalAppointments ? (item.value / stats.totalAppointments) * 100 : 0}%`, background: item.color, borderRadius: '4px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}

                {/* Summary boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginTop: '20px' }}>
                  {[
                    { label: 'Scheduled', value: stats.scheduled, bg: '#dbeafe', color: '#1d4ed8' },
                    { label: 'Completed', value: stats.completed, bg: '#dcfce7', color: '#15803d' },
                    { label: 'Cancelled', value: stats.cancelled, bg: '#fee2e2', color: '#dc2626' },
                  ].map(b => (
                    <div key={b.label} style={{ background: b.bg, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '22px', fontWeight: '700', color: b.color, margin: 0 }}>{b.value}</p>
                      <p style={{ fontSize: '11px', color: b.color, margin: '2px 0 0', fontWeight: '600' }}>{b.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department wise patients */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>Patients by Department</h2>
              {Object.keys(stats.departments).length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>No patient data yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(stats.departments).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
                    <div key={dept}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{dept}</span>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{count} patients</span>
                      </div>
                      <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(count / maxDept) * 100}%`, background: '#0ea5e9', borderRadius: '5px', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;