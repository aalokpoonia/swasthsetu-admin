import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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

const Toggle = ({ checked, onChange }) => (
  <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: checked ? THEME.accent : '#e5e7eb', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: checked ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    appointmentAlerts: true,
    patientAdmissionAlerts: false,
    weeklyReport: true,
    hospitalName: 'SwasthSetu Hospital',
    adminPhone: '',
    bedsTotal: '200',
    timezone: 'Asia/Kolkata',
  });

  useEffect(() => {
    auth.onAuthStateChanged(async u => {
      if (!u) navigate('/');
      else {
        setUser(u);
        try {
          const snap = await getDoc(doc(db, 'settings', u.uid));
          if (snap.exists()) setSettings(prev => ({ ...prev, ...snap.data() }));
        } catch (e) { console.error(e); }
      }
    });
  }, [navigate]);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'settings', user.uid), settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const inputStyle = { padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', background: 'white' };

  const SectionCard = ({ title, desc, children }) => (
    <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '24px', marginBottom: 16 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{title}</h3>
      <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 20px' }}>{desc}</p>
      {children}
    </div>
  );

  const ToggleRow = ({ label, desc, settingKey }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{desc}</div>
      </div>
      <Toggle checked={settings[settingKey]} onChange={() => toggle(settingKey)} />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f9fafb' }}>
      <Sidebar active="" navigate={navigate} user={user} />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'white', border: '1px solid #e5e7eb', cursor: 'pointer', color: '#6b7280', fontSize: 13, padding: '6px 10px', borderRadius: 6 }}>← Back</button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Settings</h1>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '3px 0 0' }}>Manage your hospital preferences</p>
            </div>
          </div>
          <button onClick={handleSave} style={{ padding: '9px 20px', background: THEME.accent, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Hospital Info */}
          <SectionCard title="Hospital Information" desc="Basic details about your hospital">
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Hospital Name</label>
              <input style={inputStyle} value={settings.hospitalName} onChange={e => setSettings({ ...settings, hospitalName: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Admin Phone</label>
              <input style={inputStyle} placeholder="e.g. 9876543210" value={settings.adminPhone} onChange={e => setSettings({ ...settings, adminPhone: e.target.value })} />
            </div>
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Total Beds</label>
              <input style={inputStyle} type="number" value={settings.bedsTotal} onChange={e => setSettings({ ...settings, bedsTotal: e.target.value })} />
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title="Notifications" desc="Control what alerts you receive">
            <ToggleRow label="Email Notifications" desc="Receive general email updates" settingKey="emailNotifications" />
            <ToggleRow label="Appointment Alerts" desc="Get notified for new appointments" settingKey="appointmentAlerts" />
            <ToggleRow label="Patient Admission Alerts" desc="Alert when a patient is admitted" settingKey="patientAdmissionAlerts" />
            <ToggleRow label="Weekly Report" desc="Receive weekly analytics report" settingKey="weeklyReport" />
          </SectionCard>

          {/* System */}
          <SectionCard title="System" desc="App configuration">
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Timezone</label>
              <select style={inputStyle} value={settings.timezone} onChange={e => setSettings({ ...settings, timezone: e.target.value })}>
                <option value="Asia/Kolkata">India (IST) — Asia/Kolkata</option>
                <option value="Asia/Dubai">Dubai — Asia/Dubai</option>
                <option value="Europe/London">London — GMT</option>
                <option value="America/New_York">New York — EST</option>
              </select>
            </div>
          </SectionCard>

          {/* Danger Zone */}
          <SectionCard title="Account" desc="Manage your session">
            <div style={{ padding: '14px', background: '#fff1f2', borderRadius: 8, border: '1px solid #fecdd3' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#9f1239', marginBottom: 6 }}>Sign Out</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>You will be redirected to the login page.</div>
              <button onClick={() => signOut(auth).then(() => navigate('/'))}
                style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                Sign out now
              </button>
            </div>
          </SectionCard>

        </div>
      </main>
    </div>
  );
};

export default Settings;