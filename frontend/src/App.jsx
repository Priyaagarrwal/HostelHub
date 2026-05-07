import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import WardenDashboard from './components/WardenDashboard';
import MessStaffDashboard from './components/MessStaffDashboard';
import AdminDashboard from './components/AdminDashboard';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to their respective dashboard if they try to access another role's page
    switch (userRole) {
      case 'student': return <Navigate to="/student" replace />;
      case 'warden': return <Navigate to="/warden" replace />;
      case 'mess_staff': return <Navigate to="/mess-staff" replace />;
      case 'admin': return <Navigate to="/admin" replace />;
      default: return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/warden/*" element={
          <ProtectedRoute allowedRoles={['warden']}>
            <WardenDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/mess-staff/*" element={
          <ProtectedRoute allowedRoles={['mess_staff']}>
            <MessStaffDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
