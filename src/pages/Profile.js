import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
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

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0 });
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged(async u => {
      if (!u) navigate('/');
      else {
        setUser(u);
        try {
          const p = await getDocs(collection(db, 'patients'));
          const d = await getDocs(collection(db, 'doctors'));
          const a = await getDocs(collection(db, 'appointments'));
          setStats({ patients: p.size, doctors: d.size, appointments: a.size });
        } catch (e) { console.error(e); }
      }
    });
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) { setPassMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
    if (newPass.length < 6) { setPassMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return; }
    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      setPassMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (e) {
      setPassMsg({ type: 'error', text: 'Current password is incorrect.' });
    } finally { setSaving(false); }
  };

  const inputStyle = { padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', background: 'white' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f9fafb' }}>
      <Sidebar active="" navigate={navigate} user={user} />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white' }}>← Back</button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>My Profile</h1>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '3px 0 0' }}>Manage your account details</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>

          {/* Left - Profile Card */}
          <div>
            {/* Avatar + Info */}
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '28px 24px', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: THEME.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 700, margin: '0 auto 16px' }}>
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{user?.email?.split('@')[0] || 'Admin'}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{user?.email}</div>
              <span style={{ padding: '4px 12px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Administrator</span>
            </div>

            {/* Stats */}
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 16 }}>System Overview</h3>
              {[
                { label: 'Total Patients', value: stats.patients, icon: '👤' },
                { label: 'Total Doctors', value: stats.doctors, icon: '👨‍⚕️' },
                { label: 'Appointments', value: stats.appointments, icon: '📅' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{s.icon}</span>
                    <span style={{ fontSize: 13, color: '#374151' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Details + Password */}
          <div>
            {/* Account Details */}
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '24px', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Account Details</h3>
              {[
                { label: 'Username', value: user?.email?.split('@')[0] || 'admin' },
                { label: 'Email', value: user?.email || '—' },
                { label: 'Role', value: 'Administrator' },
                { label: 'Account ID', value: user?.uid?.slice(0, 12) + '...' || '—' },
                { label: 'Email Verified', value: user?.emailVerified ? '✅ Verified' : '⚠️ Not verified' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Change Password */}
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Change Password</h3>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Make sure your new password is at least 6 characters.</p>
              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Current Password</label>
                  <input type="password" style={inputStyle} placeholder="Enter current password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} required />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>New Password</label>
                  <input type="password" style={inputStyle} placeholder="Enter new password" value={newPass} onChange={e => setNewPass(e.target.value)} required />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Confirm New Password</label>
                  <input type="password" style={inputStyle} placeholder="Confirm new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
                </div>
                {passMsg && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 12, fontWeight: 600, background: passMsg.type === 'error' ? '#fff1f2' : '#f0fdf4', color: passMsg.type === 'error' ? '#dc2626' : '#166534', border: `1px solid ${passMsg.type === 'error' ? '#fecdd3' : '#bbf7d0'}` }}>
                    {passMsg.text}
                  </div>
                )}
                <button type="submit" disabled={saving} style={{ padding: '9px 20px', background: THEME.accent, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;