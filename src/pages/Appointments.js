import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import {
  collection, addDoc, getDocs, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';

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
  const [formData, setFormData] = useState({
    patientName: '', doctorName: '', department: 'Cardiology',
    date: '', time: '', status: 'Scheduled', notes: '',
  });

  const DEPARTMENTS = ['Cardiology', 'Orthopedics', 'Neurology', 'Gynecology', 'General', 'Pediatrics', 'ENT', 'Dermatology'];
  const STATUSES = ['Scheduled', 'Completed', 'Cancelled'];

  const statusStyle = (s) => {
    if (s === 'Scheduled') return { background: '#dbeafe', color: '#1d4ed8' };
    if (s === 'Completed') return { background: '#dcfce7', color: '#15803d' };
    return { background: '#fee2e2', color: '#dc2626' };
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setEditingAppt(null);
    setFormData({ patientName: '', doctorName: '', department: 'Cardiology', date: '', time: '', status: 'Scheduled', notes: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditingAppt(a);
    setFormData({ patientName: a.patientName || '', doctorName: a.doctorName || '', department: a.department || 'Cardiology', date: a.date || '', time: a.time || '', status: a.status || 'Scheduled', notes: a.notes || '' });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.doctorName.trim() || !formData.date) {
      setFormError('Patient name, doctor name, and date are required.');
      return;
    }
    setSaving(true);
    try {
      if (editingAppt) {
        await updateDoc(doc(db, 'appointments', editingAppt.id), { ...formData, updatedAt: serverTimestamp() });
        showToast('Appointment updated!');
      } else {
        const snap = await getDocs(collection(db, 'appointments'));
        const num = String(snap.size + 1).padStart(3, '0');
        await addDoc(collection(db, 'appointments'), { ...formData, apptId: `A-${num}`, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        showToast('Appointment added!');
      }
      setShowModal(false);
      fetchAppointments();
    } catch (e) { setFormError('Something went wrong.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'appointments', id));
    showToast('Appointment deleted.', 'error');
    setDeleteConfirm(null);
    fetchAppointments();
  };

  const handleLogout = async () => { await signOut(auth); navigate('/'); };

  const filtered = appointments.filter((a) =>
    a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.apptId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Patients', icon: '👤', path: '/patients' },
    { label: 'Doctors', icon: '👨‍⚕️', path: '/doctors' },
    { label: 'Appointments', icon: '📅', path: '/appointments' },
    { label: 'Reports', icon: '📋', path: '/reports' },
  ];

  const s = {
    wrap: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f1f5f9' },
    sidebar: { width: '210px', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px 0', flexShrink: 0 },
    navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', background: active ? '#0ea5e9' : 'transparent', color: active ? 'white' : '#94a3b8', borderRadius: active ? '0 8px 8px 0' : 0, marginRight: '12px' }),
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'white', borderRadius: '14px', padding: '32px', width: '500px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' },
    input: { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
    select: { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', background: 'white' },
    label: { fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' },
    toast: (type) => ({ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', zIndex: 2000, background: type === 'error' ? '#fef2f2' : '#f0fdf4', color: type === 'error' ? '#dc2626' : '#15803d', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }),
  };

  return (
    <div style={s.wrap}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1e293b' }}>
          <p style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>SwasthSetu</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map((item) => (
            <div key={item.label} style={s.navItem(item.path === '/appointments')} onClick={() => navigate(item.path)}>
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
      <main style={{ flex: 1, padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Appointments</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{appointments.length} total appointments</p>
          </div>
          <button style={{ padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }} onClick={openAdd}>+ New Appointment</button>
        </div>

        <input style={{ width: '100%', maxWidth: '360px', padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', marginBottom: '20px', background: 'white' }}
          placeholder="🔍  Search patient, doctor, department..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>⏳ Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              {searchTerm ? '🔍 No results.' : '📅 No appointments yet. Click "New Appointment" to add one.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Appt ID', 'Patient', 'Doctor', 'Department', 'Date & Time', 'Status', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ ...s.td, color: '#0ea5e9', fontWeight: '600' }}>{a.apptId}</td>
                    <td style={{ ...s.td, fontWeight: '600' }}>{a.patientName}</td>
                    <td style={s.td}>{a.doctorName}</td>
                    <td style={s.td}>{a.department}</td>
                    <td style={s.td}>
                      <div>{a.date}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{a.time}</div>
                    </td>
                    <td style={s.td}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', ...statusStyle(a.status) }}>{a.status}</span>
                    </td>
                    <td style={s.td}>
                      <button style={{ padding: '5px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', background: '#eff6ff', color: '#1d4ed8', marginRight: '6px' }} onClick={() => openEdit(a)}>✏️ Edit</button>
                      <button style={{ padding: '5px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', background: '#fef2f2', color: '#dc2626' }} onClick={() => setDeleteConfirm(a.id)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
              {editingAppt ? '✏️ Edit Appointment' : '➕ New Appointment'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={s.label}>Patient Name *</label>
                  <input style={s.input} placeholder="e.g. Rahul Sharma" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} />
                </div>
                <div>
                  <label style={s.label}>Doctor Name *</label>
                  <input style={s.input} placeholder="e.g. Dr. Mehta" value={formData.doctorName} onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })} />
                </div>
                <div>
                  <label style={s.label}>Department</label>
                  <select style={s.select} value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Date *</label>
                  <input style={s.input} type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div>
                  <label style={s.label}>Time</label>
                  <input style={s.input} type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                </div>
                <div>
                  <label style={s.label}>Status</label>
                  <select style={s.select} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    {STATUSES.map(st => <option key={st}>{st}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={s.label}>Notes</label>
                  <input style={s.input} placeholder="Any notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>
              {formError && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '10px' }}>⚠️ {formError}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" style={{ padding: '10px 20px', border: '1.5px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }} disabled={saving}>{saving ? 'Saving...' : editingAppt ? 'Update' : 'Add Appointment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={s.overlay}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', width: '360px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Delete Appointment?</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>This cannot be undone.</p>
            <button style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginRight: '10px' }} onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
            <button style={{ padding: '10px 20px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {toast && <div style={s.toast(toast.type)}>{toast.type === 'error' ? '❌' : '✅'} {toast.msg}</div>}
    </div>
  );
};

export default Appointments;
