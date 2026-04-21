import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import {
  collection, addDoc, getDocs, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '', specialization: 'Cardiology', phone: '',
    email: '', experience: '', status: 'Active',
  });

  const SPECIALIZATIONS = ['Cardiology', 'Orthopedics', 'Neurology', 'Gynecology', 'General', 'Pediatrics', 'ENT', 'Dermatology'];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'doctors'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setDoctors(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setEditingDoctor(null);
    setFormData({ name: '', specialization: 'Cardiology', phone: '', email: '', experience: '', status: 'Active' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditingDoctor(d);
    setFormData({ name: d.name || '', specialization: d.specialization || 'Cardiology', phone: d.phone || '', email: d.email || '', experience: d.experience || '', status: d.status || 'Active' });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) { setFormError('Name and Phone are required.'); return; }
    setSaving(true);
    try {
      if (editingDoctor) {
        await updateDoc(doc(db, 'doctors', editingDoctor.id), { ...formData, updatedAt: serverTimestamp() });
        showToast('Doctor updated!');
      } else {
        const snap = await getDocs(collection(db, 'doctors'));
        const num = String(snap.size + 1).padStart(3, '0');
        await addDoc(collection(db, 'doctors'), { ...formData, doctorId: `D-${num}`, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        showToast('Doctor added!');
      }
      setShowModal(false);
      fetchDoctors();
    } catch (e) { setFormError('Something went wrong.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'doctors', id));
    showToast('Doctor deleted.', 'error');
    setDeleteConfirm(null);
    fetchDoctors();
  };

  const handleLogout = async () => { await signOut(auth); navigate('/'); };

  const filtered = doctors.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.doctorId?.toLowerCase().includes(searchTerm.toLowerCase())
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
    logo: { padding: '0 20px 24px', borderBottom: '1px solid #1e293b' },
    navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', background: active ? '#0ea5e9' : 'transparent', color: active ? 'white' : '#94a3b8', borderRadius: active ? '0 8px 8px 0' : 0, marginRight: '12px', transition: 'all 0.2s' }),
    main: { flex: 1, padding: '28px 32px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    addBtn: { padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    card: { background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'white', borderRadius: '14px', padding: '32px', width: '480px', maxWidth: '95vw' },
    input: { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
    select: { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', background: 'white' },
    label: { fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' },
    toast: (type) => ({ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', zIndex: 2000, background: type === 'error' ? '#fef2f2' : '#f0fdf4', color: type === 'error' ? '#dc2626' : '#15803d', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }),
  };

  return (
    <div style={s.wrap}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>
          <p style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>SwasthSetu</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map((item) => (
            <div key={item.label} style={s.navItem(item.path === '/doctors')} onClick={() => navigate(item.path)}>
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
      <main style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Doctor Management</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{doctors.length} doctors registered</p>
          </div>
          <button style={s.addBtn} onClick={openAdd}>+ Add Doctor</button>
        </div>

        <input style={{ width: '100%', maxWidth: '360px', padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', marginBottom: '20px', background: 'white' }}
          placeholder="🔍  Search by name, ID, specialization..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        <div style={s.card}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>⏳ Loading doctors...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              {searchTerm ? '🔍 No doctors match your search.' : '👨‍⚕️ No doctors added yet.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Doctor ID', 'Name', 'Specialization', 'Phone', 'Experience', 'Status', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ ...s.td, color: '#0ea5e9', fontWeight: '600' }}>{d.doctorId}</td>
                    <td style={s.td}>
                      <div style={{ fontWeight: '600' }}>{d.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{d.email}</div>
                    </td>
                    <td style={s.td}>{d.specialization}</td>
                    <td style={s.td}>{d.phone}</td>
                    <td style={s.td}>{d.experience ? `${d.experience} yrs` : '—'}</td>
                    <td style={s.td}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: d.status === 'Active' ? '#dcfce7' : '#fee2e2', color: d.status === 'Active' ? '#15803d' : '#dc2626' }}>
                        {d.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button style={{ padding: '5px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', background: '#eff6ff', color: '#1d4ed8', marginRight: '6px' }} onClick={() => openEdit(d)}>✏️ Edit</button>
                      <button style={{ padding: '5px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', background: '#fef2f2', color: '#dc2626' }} onClick={() => setDeleteConfirm(d.id)}>🗑️ Delete</button>
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
              {editingDoctor ? '✏️ Edit Doctor' : '➕ Add New Doctor'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={s.label}>Full Name *</label>
                  <input style={s.input} placeholder="e.g. Dr. Mehta" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label style={s.label}>Specialization</label>
                  <select style={s.select} value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}>
                    {SPECIALIZATIONS.map(sp => <option key={sp}>{sp}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Experience (years)</label>
                  <input style={s.input} type="number" placeholder="e.g. 5" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
                </div>
                <div>
                  <label style={s.label}>Phone *</label>
                  <input style={s.input} placeholder="e.g. 9876543210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label style={s.label}>Email</label>
                  <input style={s.input} type="email" placeholder="doctor@hospital.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={s.label}>Status</label>
                  <select style={s.select} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
              </div>
              {formError && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '10px' }}>⚠️ {formError}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" style={{ padding: '10px 20px', border: '1.5px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }} disabled={saving}>{saving ? 'Saving...' : editingDoctor ? 'Update Doctor' : 'Add Doctor'}</button>
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
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Delete Doctor?</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>This cannot be undone.</p>
            <button style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginRight: '10px' }} onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
            <button style={{ padding: '10px 20px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div style={s.toast(toast.type)}>{toast.type === 'error' ? '❌' : '✅'} {toast.msg}</div>}
    </div>
  );
};

export default Doctors;
