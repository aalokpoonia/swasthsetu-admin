import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

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

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState('');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ patientName: '', doctorName: '', department: 'Cardiology', date: '', time: '', status: 'Scheduled', notes: '' });

  const DEPARTMENTS = ['Cardiology','Orthopedics','Neurology','Gynecology','General','Pediatrics','ENT','Dermatology'];
  const STATUSES = ['Scheduled','Completed','Cancelled'];

  useEffect(() => { auth.onAuthStateChanged(u => { if (!u) navigate('/'); else setUser(u); }); }, [navigate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const openAdd = () => { setEditingAppt(null); setFormData({ patientName: '', doctorName: '', department: 'Cardiology', date: '', time: '', status: 'Scheduled', notes: '' }); setFormError(''); setShowModal(true); };
  const openEdit = (a) => { setEditingAppt(a); setFormData({ patientName: a.patientName||'', doctorName: a.doctorName||'', department: a.department||'Cardiology', date: a.date||'', time: a.time||'', status: a.status||'Scheduled', notes: a.notes||'' }); setFormError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.doctorName.trim() || !formData.date) { setFormError('Patient, Doctor and Date required.'); return; }
    setSaving(true);
    try {
      if (editingAppt) {
        await updateDoc(doc(db, 'appointments', editingAppt.id), { ...formData, updatedAt: serverTimestamp() });
        showToast('Appointment updated!');
      } else {
        const snap = await getDocs(collection(db, 'appointments'));
        await addDoc(collection(db, 'appointments'), { ...formData, apptId: `A-${String(snap.size + 1).padStart(3, '0')}`, createdAt: serverTimestamp() });
        showToast('Appointment added!');
      }
      setShowModal(false); fetchAppointments();
    } catch (e) { setFormError('Something went wrong.'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => { await deleteDoc(doc(db, 'appointments', id)); showToast('Deleted.', 'error'); setDeleteConfirm(null); fetchAppointments(); };
  const filtered = appointments.filter(a => a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) || a.apptId?.toLowerCase().includes(searchTerm.toLowerCase()));

  const statusStyle = (s) => {
    if (s === 'Scheduled') return { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' };
    if (s === 'Completed') return { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' };
    return { bg: '#fff1f2', color: '#9f1239', border: '#fecdd3' };
  };

  const inputStyle = { padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', background: 'white' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f9fafb' }}>
      <Sidebar active="/appointments" navigate={navigate} user={user} />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div><h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Appointments</h1><p style={{ fontSize: 13, color: '#9ca3af', margin: '3px 0 0' }}>{appointments.length} total appointments</p></div>
          <button style={{ padding: '9px 18px', background: THEME.accent, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }} onClick={openAdd}>+ New Appointment</button>
        </div>
        <input style={{ width: '100%', maxWidth: 360, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', marginBottom: 20, background: 'white' }} placeholder="Search by patient, doctor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
            : filtered.length === 0 ? <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>No appointments yet.</div>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f9fafb' }}>{['Appt ID','Patient','Doctor','Department','Date & Time','Status','Actions'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.map(a => {
                    const st = statusStyle(a.status);
                    return (
                      <tr key={a.id} style={{ borderTop: '1px solid #f3f4f6' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 14px', fontSize: 13, color: THEME.accent, fontWeight: 700 }}>{a.apptId}</td>
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{a.patientName}</td>
                        <td style={{ padding: '12px 14px', fontSize: 13, color: '#6b7280' }}>{a.doctorName}</td>
                        <td style={{ padding: '12px 14px', fontSize: 13, color: '#6b7280' }}>{a.department}</td>
                        <td style={{ padding: '12px 14px' }}><div style={{ fontSize: 13, color: '#111827' }}>{a.date}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{a.time}</div></td>
                        <td style={{ padding: '12px 14px' }}><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{a.status}</span></td>
                        <td style={{ padding: '12px 14px' }}>
                          <button style={{ padding: '4px 10px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, background: 'white', color: '#374151', marginRight: 6 }} onClick={() => openEdit(a)}>Edit</button>
                          <button style={{ padding: '4px 10px', border: '1px solid #fecdd3', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, background: '#fff1f2', color: '#dc2626' }} onClick={() => setDeleteConfirm(a.id)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
        </div>
      </main>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: 12, padding: 32, width: 500, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>{editingAppt ? 'Edit Appointment' : 'New Appointment'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Patient Name *</label><input style={inputStyle} placeholder="e.g. Rahul Sharma" value={formData.patientName} onChange={e => setFormData({ ...formData, patientName: e.target.value })} /></div>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Doctor Name *</label><input style={inputStyle} placeholder="e.g. Dr. Mehta" value={formData.doctorName} onChange={e => setFormData({ ...formData, doctorName: e.target.value })} /></div>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Department</label><select style={inputStyle} value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select></div>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Date *</label><input style={inputStyle} type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Time</label><input style={inputStyle} type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} /></div>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Status</label><select style={inputStyle} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
                <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Notes</label><input style={inputStyle} placeholder="Any notes..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} /></div>
              </div>
              {formError && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 10 }}>⚠️ {formError}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button type="button" style={{ padding: '9px 18px', border: '1px solid #e5e7eb', background: 'white', borderRadius: 8, cursor: 'pointer', fontSize: 13 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ padding: '9px 20px', background: THEME.accent, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }} disabled={saving}>{saving ? 'Saving...' : editingAppt ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 28, width: 360, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Delete Appointment?</h3>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>This cannot be undone.</p>
            <button style={{ padding: '9px 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginRight: 8 }} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            <button style={{ padding: '9px 18px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer' }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
          </div>
        </div>
      )}
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 2000, background: toast.type === 'error' ? '#fff1f2' : '#f0fdf4', color: toast.type === 'error' ? '#dc2626' : '#166534', border: `1px solid ${toast.type === 'error' ? '#fecdd3' : '#bbf7d0'}` }}>{toast.msg}</div>}
    </div>
  );
};

export default Appointments;