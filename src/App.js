import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';

function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  if (user === undefined) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#64748b' }}>
      Loading...
    </div>
  );

  return user ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/patients" element={<PrivateRoute><Patients /></PrivateRoute>} />
        <Route path="/doctors" element={<PrivateRoute><Doctors /></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
import Reports from './pages/Reports';

// Routes ke andar:
<Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />