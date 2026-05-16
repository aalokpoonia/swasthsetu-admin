import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

const THEME = { sidebar: '#111827', accent: '#10b981' };
const navItems = [
  { icon: '⊞', label: 'Dashboard', path: '/dashboard' },
  { icon: '♡', label: 'Patients', path: '/patients' },
  { icon: '✚', label: 'Doctors', path: '/doctors' },
  { icon: '◷', label: 'Appointments', path: '/appointments' },
  { icon: '◈', label: 'Reports', path: '/reports' },
];

const Sidebar = ({ active, navigate, user }) => (
  <div style={{ width: 230, background: THEME.sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
    <div style={{ padding: '24px 20px', borderBottom: '1px solid #1f2937' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🏥</div>
        <div><div style={{ color: '#f9fafb', fontWeight: 700, fontSize: 15 }}>SwasthSetu</div><div style={{ color: '#6b7280', fontSize: 10 }}>Admin Panel</div></div>
      </div>
    </div>
    <nav style={{ flex: 1, padding: '16px 12px' }}>
      <p style={{ color: '#4b5563', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 8 }}>Menu</p>
      {navItems.map(item => {
        const isActive = item.path === active;
        return (
          <div key={item.label} onClick={() => navigate(item.path)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', marginBottom: 2, cursor: 'pointer', borderRadius: 8, fontSize: 13, background: isActive ? '#1f2937' : 'transparent', color: isActive ? '#f9fafb' : '#6b7280', fontWeight: isActive ? 600 : 400, borderLeft: isActive ? `2px solid ${THEME.accent}` : '2px solid transparent' }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#1f2937'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
            <span>{item.icon}</span><span>{item.label}</span>
          </div>
        );
      })}
    </nav>
    <div style={{ padding: '14px 12px', borderTop: '1px solid #1f2937' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#1f2937', borderRadius: 8, marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: THEME.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>{user?.email?.charAt(0).toUpperCase() || 'A'}</div>
        <div><div style={{ color: '#f3f4f6', fontSize: 12, fontWeight: 600 }}>{user?.email?.split('@')[0] || 'Admin'}</div><div style={{ color: '#6b7280', fontSize: 10 }}>Administrator</div></div>
      </div>
      <button onClick={() => signOut(auth).then(() => navigate('/'))} style={{ width: '100%', padding: '7px 0', background: 'transparent', color: '#6b7280', border: '1px solid #374151', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
        onMouseEnter={e => { e.target.style.borderColor = '#ef4444'; e.target.style.color = '#ef4444'; }}
        onMouseLeave={e => { e.target.style.borderColor = '#374151'; e.target.style.color = '#6b7280'; }}>Sign out</button>
    </div>
  </div>
);

const Reports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, totalAppointments: 0, admitted: 0, underTreatment: 0, discharged: 0, critical: 0, scheduled: 0, completed: 0, cancelled: 0, departments: {} });

  useEffect(() => { auth.onAuthStateChanged(u => { if (!u) navigate('/'); else setUser(u); }); }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const pSnap = await getDocs(collection(db, 'patients'));
        const dSnap = await getDocs(collection(db, 'doctors'));
        const aSnap = await getDocs(collection(db, 'appointments'));
        const patients = pSnap.docs.map(d => d.data());
        const appointments = aSnap.docs.map(d => d.data());
        const deptCount = {};
        patients.forEach(p => { if (p.department) deptCount[p.department] = (deptCount[p.department] || 0) + 1; });
        setStats({
          totalPatients: pSnap.size, totalDoctors: dSnap.size, totalAppointments: aSnap.size,
          admitted: patients.filter(p => p.status === 'Admitted').length,
          underTreatment: patients.filter(p => p.status === 'Under Treatment').length,
          discharged: patients.filter(p => p.status === 'Discharged').length,
          critical: patients.filter(p => p.status === 'Critical').length,
          scheduled: appointments.filter(a => a.status === 'Scheduled').length,
          completed: appointments.filter(a => a.status === 'Completed').length,
          cancelled: appointments.filter(a => a.status === 'Cancelled').length,
          departments: deptCount,
        });
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const maxDept = Math.max(...Object.values(stats.departments), 1);

  const StatCard = ({ label, value, icon, topColor }) => (
    <div style={{ background: 'white', borderRadius: 10, padding: '18px 20px', border: '1px solid #e5e7eb', borderTop: `3px solid ${topColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{loading ? '—' : value}</div>
    </div>
  );

  const BarRow = ({ label, value, total, color }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${total ? (value / total) * 100 : 0}%`, background: color, borderRadius: 4, transition: 'width 0.5s' }} />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f9fafb' }}>
      <Sidebar active="/reports" navigate={navigate} user={user} />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Reports & Analytics</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '3px 0 0' }}>Real-time data from Firestore</p>
        </div>

        {loading ? <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading reports...</div> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
              <StatCard label="Total Patients" value={stats.totalPatients} icon="👤" topColor="#6366f1" />
              <StatCard label="Total Doctors" value={stats.totalDoctors} icon="👨‍⚕️" topColor={THEME.accent} />
              <StatCard label="Total Appointments" value={stats.totalAppointments} icon="📅" topColor="#f59e0b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Patient Status</h2>
                <BarRow label="Admitted" value={stats.admitted} total={stats.totalPatients} color="#6366f1" />
                <BarRow label="Under Treatment" value={stats.underTreatment} total={stats.totalPatients} color="#f59e0b" />
                <BarRow label="Discharged" value={stats.discharged} total={stats.totalPatients} color={THEME.accent} />
                <BarRow label="Critical" value={stats.critical} total={stats.totalPatients} color="#ef4444" />
              </div>

              <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Appointment Status</h2>
                <BarRow label="Scheduled" value={stats.scheduled} total={stats.totalAppointments} color="#6366f1" />
                <BarRow label="Completed" value={stats.completed} total={stats.totalAppointments} color={THEME.accent} />
                <BarRow label="Cancelled" value={stats.cancelled} total={stats.totalAppointments} color="#ef4444" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 20 }}>
                  {[{ label: 'Scheduled', value: stats.scheduled, bg: '#eff6ff', color: '#1e40af' }, { label: 'Completed', value: stats.completed, bg: '#f0fdf4', color: '#166534' }, { label: 'Cancelled', value: stats.cancelled, bg: '#fff1f2', color: '#dc2626' }].map(b => (
                    <div key={b.label} style={{ background: b.bg, borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: b.color }}>{b.value}</div>
                      <div style={{ fontSize: 11, color: b.color, marginTop: 2, fontWeight: 600 }}>{b.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Patients by Department</h2>
              {Object.keys(stats.departments).length === 0
                ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No patient data yet.</p>
                : Object.entries(stats.departments).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
                  <div key={dept} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{dept}</span>
                      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{count} patients</span>
                    </div>
                    <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(count / maxDept) * 100}%`, background: THEME.accent, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;