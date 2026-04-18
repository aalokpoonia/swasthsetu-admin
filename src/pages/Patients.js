import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

const Patients = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null); // null = add mode
  const [deleteConfirm, setDeleteConfirm] = useState(null);  // patient id to delete
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    department: 'Cardiology',
    doctor: '',
    status: 'Admitted',
    address: '',
    bloodGroup: 'A+',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  // ── Constants ──────────────────────────────────────────────────────────────
  const DEPARTMENTS = ['Cardiology', 'Orthopedics', 'Neurology', 'Gynecology', 'General', 'Pediatrics', 'ENT', 'Dermatology'];
  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const STATUSES = ['Admitted', 'Under Treatment', 'Discharged', 'Critical'];

  // ── Firestore Helpers ──────────────────────────────────────────────────────
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPatients(list);
    } catch (err) {
      console.error(err);
      showToast('Failed to load patients.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Modal Helpers ──────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingPatient(null);
    setFormData({
      name: '', age: '', gender: 'Male', phone: '', email: '',
      department: 'Cardiology', doctor: '', status: 'Admitted',
      address: '', bloodGroup: 'A+',
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name || '',
      age: patient.age || '',
      gender: patient.gender || 'Male',
      phone: patient.phone || '',
      email: patient.email || '',
      department: patient.department || 'Cardiology',
      doctor: patient.doctor || '',
      status: patient.status || 'Admitted',
      address: patient.address || '',
      bloodGroup: patient.bloodGroup || 'A+',
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPatient(null);
  };

  // ── Form Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!formData.name.trim() || !formData.age || !formData.phone.trim()) {
      setFormError('Name, Age, and Phone are required.');
      return;
    }
    if (isNaN(formData.age) || Number(formData.age) <= 0 || Number(formData.age) > 150) {
      setFormError('Please enter a valid age.');
      return;
    }

    setSaving(true);
    try {
      if (editingPatient) {
        // UPDATE
        await updateDoc(doc(db, 'patients', editingPatient.id), {
          ...formData,
          age: Number(formData.age),
          updatedAt: serverTimestamp(),
        });
        showToast('Patient updated successfully!');
      } else {
        // ADD — auto-generate Patient ID
        const snapshot = await getDocs(collection(db, 'patients'));
        const patientNumber = String(snapshot.size + 1).padStart(3, '0');
        await addDoc(collection(db, 'patients'), {
          ...formData,
          age: Number(formData.age),
          patientId: `P-${patientNumber}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast('Patient added successfully!');
      }
      closeModal();
      fetchPatients();
    } catch (err) {
      console.error(err);
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'patients', id));
      showToast('Patient deleted.', 'error');
      setDeleteConfirm(null);
      fetchPatients();
    } catch (err) {
      console.error(err);
      showToast('Delete failed.', 'error');
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // ── Filtered List ──────────────────────────────────────────────────────────
  const filtered = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Status Badge ───────────────────────────────────────────────────────────
  const statusStyle = (status) => {
    switch (status) {
      case 'Admitted':       return { background: '#dbeafe', color: '#1d4ed8' };
      case 'Under Treatment':return { background: '#fef9c3', color: '#b45309' };
      case 'Discharged':     return { background: '#dcfce7', color: '#15803d' };
      case 'Critical':       return { background: '#fee2e2', color: '#dc2626' };
      default:               return { background: '#f3f4f6', color: '#374151' };
    }
  };

  // ── Sidebar Nav Items ──────────────────────────────────────────────────────
  const navItems = [
    { label: 'Dashboard',    icon: '📊', path: '/dashboard' },
    { label: 'Patients',     icon: '👤', path: '/patients' },
    { label: 'Doctors',      icon: '👨‍⚕️', path: '/doctors' },
    { label: 'Appointments', icon: '📅', path: '/appointments' },
    { label: 'Reports',      icon: '📋', path: '/reports' },
  ];

  // ── Styles ─────────────────────────────────────────────────────────────────
  const styles = {
    container:    { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f1f5f9' },
    sidebar:      { width: '210px', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px 0', flexShrink: 0 },
    logo:         { padding: '0 20px 24px', borderBottom: '1px solid #1e293b' },
    logoTitle:    { fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 },
    logoSub:      { fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' },
    nav:          { flex: 1, padding: '16px 0' },
    navItem:      (active) => ({
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 20px', cursor: 'pointer', fontSize: '14px',
                    background: active ? '#0ea5e9' : 'transparent',
                    color: active ? 'white' : '#94a3b8',
                    borderRadius: active ? '0 8px 8px 0' : '0',
                    marginRight: '12px', transition: 'all 0.2s',
                  }),
    sidebarFooter:{ padding: '16px 20px', borderTop: '1px solid #1e293b' },
    adminEmail:   { fontSize: '11px', color: '#64748b', marginBottom: '10px' },
    logoutBtn:    {
                    width: '100%', padding: '8px', background: '#ef4444',
                    color: 'white', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  },
    main:         { flex: 1, padding: '28px 32px', overflowY: 'auto' },
    pageHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    pageTitle:    { fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: 0 },
    pageSubtitle: { fontSize: '13px', color: '#64748b', margin: '4px 0 0' },
    addBtn:       {
                    padding: '10px 20px', background: '#0ea5e9', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                  },
    searchBar:    {
                    width: '100%', maxWidth: '360px', padding: '10px 16px',
                    border: '1px solid #e2e8f0', borderRadius: '8px',
                    fontSize: '14px', outline: 'none', marginBottom: '20px',
                    background: 'white',
                  },
    card:         {
                    background: 'white', borderRadius: '12px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden',
                  },
    table:        { width: '100%', borderCollapse: 'collapse' },
    th:           {
                    padding: '12px 16px', textAlign: 'left', fontSize: '12px',
                    fontWeight: '600', color: '#64748b', textTransform: 'uppercase',
                    letterSpacing: '0.05em', background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                  },
    td:           { padding: '14px 16px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' },
    badge:        (status) => ({
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                    fontWeight: '600', display: 'inline-block', ...statusStyle(status),
                  }),
    actionBtn:    (color) => ({
                    padding: '5px 12px', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                    background: color === 'blue' ? '#eff6ff' : '#fef2f2',
                    color: color === 'blue' ? '#1d4ed8' : '#dc2626',
                    marginRight: '6px',
                  }),
    // Modal
    overlay:      {
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000,
                  },
    modal:        {
                    background: 'white', borderRadius: '14px', padding: '32px',
                    width: '560px', maxWidth: '95vw', maxHeight: '90vh',
                    overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  },
    modalTitle:   { fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' },
    formGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    formGroup:    { display: 'flex', flexDirection: 'column', gap: '6px' },
    label:        { fontSize: '13px', fontWeight: '600', color: '#374151' },
    input:        {
                    padding: '9px 12px', border: '1.5px solid #e2e8f0',
                    borderRadius: '8px', fontSize: '14px', outline: 'none',
                    transition: 'border-color 0.2s',
                  },
    select:       {
                    padding: '9px 12px', border: '1.5px solid #e2e8f0',
                    borderRadius: '8px', fontSize: '14px', outline: 'none',
                    background: 'white', cursor: 'pointer',
                  },
    fullWidth:    { gridColumn: '1 / -1' },
    errorText:    { color: '#dc2626', fontSize: '13px', marginTop: '8px' },
    modalFooter:  { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
    cancelBtn:    {
                    padding: '10px 20px', border: '1.5px solid #e2e8f0',
                    background: 'white', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '600', color: '#374151',
                  },
    saveBtn:      {
                    padding: '10px 24px', background: '#0ea5e9', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '600',
                  },
    // Toast
    toast:        (type) => ({
                    position: 'fixed', bottom: '24px', right: '24px',
                    padding: '12px 20px', borderRadius: '10px', fontSize: '14px',
                    fontWeight: '600', zIndex: 2000,
                    background: type === 'error' ? '#fef2f2' : '#f0fdf4',
                    color: type === 'error' ? '#dc2626' : '#15803d',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    border: `1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                  }),
    // Delete confirm
    deleteBox:    {
                    background: 'white', borderRadius: '12px', padding: '28px',
                    width: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    textAlign: 'center',
                  },
    deleteTitle:  { fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' },
    deleteText:   { fontSize: '14px', color: '#64748b', marginBottom: '20px' },
    deleteConfBtn:{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginRight: '10px' },
    deleteCancelBtn:{ padding: '10px 20px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    emptyState:   { padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '15px' },
    loadingState: { padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '15px' },
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      {/* ── Sidebar ── */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <p style={styles.logoTitle}>SwasthSetu</p>
          <p style={styles.logoSub}>Admin Panel</p>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <div
              key={item.label}
              style={styles.navItem(item.path === '/patients')}
              onClick={() => navigate(item.path)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <p style={styles.adminEmail}>{auth.currentUser?.email}</p>
          <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Patient Management</h1>
            <p style={styles.pageSubtitle}>
              {patients.length} total patients · manage records with ease
            </p>
          </div>
          <button style={styles.addBtn} onClick={openAddModal}>
            + Add Patient
          </button>
        </div>

        {/* Search */}
        <input
          style={styles.searchBar}
          type="text"
          placeholder="🔍  Search by name, ID, department, doctor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Table */}
        <div style={styles.card}>
          {loading ? (
            <div style={styles.loadingState}>⏳ Loading patients...</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              {searchTerm ? '🔍 No patients match your search.' : '🏥 No patients added yet. Click "Add Patient" to get started.'}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Patient ID', 'Name', 'Age / Gender', 'Department', 'Doctor', 'Blood Group', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...styles.td, color: '#0ea5e9', fontWeight: '600' }}>{p.patientId}</td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '600' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{p.phone}</div>
                    </td>
                    <td style={styles.td}>{p.age} / {p.gender}</td>
                    <td style={styles.td}>{p.department}</td>
                    <td style={styles.td}>{p.doctor || '—'}</td>
                    <td style={styles.td}>
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge(p.status)}>{p.status}</span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.actionBtn('blue')} onClick={() => openEditModal(p)}>✏️ Edit</button>
                      <button style={styles.actionBtn('red')} onClick={() => setDeleteConfirm(p.id)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingPatient ? '✏️ Edit Patient' : '➕ Add New Patient'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                {/* Name */}
                <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Age */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Age *</label>
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="e.g. 35"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                {/* Gender */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Gender</label>
                  <select style={styles.select} value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Phone */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone *</label>
                  <input
                    style={styles.input}
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    style={styles.input}
                    type="email"
                    placeholder="e.g. patient@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Blood Group */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Blood Group</label>
                  <select style={styles.select} value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}>
                    {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>

                {/* Department */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Department</label>
                  <select style={styles.select} value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>

                {/* Doctor */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Assigned Doctor</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="e.g. Dr. Mehta"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  />
                </div>

                {/* Status */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select style={styles.select} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Address */}
                <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                  <label style={styles.label}>Address</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="e.g. 12 MG Road, Bhopal"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              {formError && <p style={styles.errorText}>⚠️ {formError}</p>}

              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" style={styles.saveBtn} disabled={saving}>
                  {saving ? 'Saving...' : editingPatient ? 'Update Patient' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div style={styles.overlay}>
          <div style={styles.deleteBox}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑️</div>
            <h3 style={styles.deleteTitle}>Delete Patient?</h3>
            <p style={styles.deleteText}>This action cannot be undone. The patient record will be permanently removed from Firestore.</p>
            <button style={styles.deleteConfBtn} onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
            <button style={styles.deleteCancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={styles.toast(toast.type)}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.message}
        </div>
      )}
    </div>
  );
};

export default Patients;
