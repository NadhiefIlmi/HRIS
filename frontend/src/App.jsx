import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import HRDashboard from './pages/HRDashboard';
import EmployeesPage from './pages/EmployeesPage';
import LeaveRequestsPage from './pages/LeaveRequestsPage';
import ProfilePage from './pages/ProfilePage';
import EmployeeDashboard from './layouts/EmployeeDashboard'; // Employee route
import UserDetail from './pages/UserDetail'; // ✅ Tambahkan ini
import AddEmployee from './pages/AddEmployee'; // Import AddEmployee
import Password from './pages/Password'; // Import Password page
import ForgotPassword from './pages/ForgotPasswordPage'; // Import Password page

function App() {
  return (
    <Router>
      {/* Toast for all pages */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* Login Page */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Pages under DashboardLayout (HR role) */}
        <Route path="/dashboard" element={<DashboardLayout><HRDashboard /></DashboardLayout>} />
        <Route path="/employees" element={<DashboardLayout><EmployeesPage /></DashboardLayout>} />
        <Route path="/leave-requests" element={<DashboardLayout><LeaveRequestsPage /></DashboardLayout>} />
        <Route path="/employees/add" element={<DashboardLayout><AddEmployee /></DashboardLayout>} />
        <Route path="/Profile" element={<DashboardLayout><ProfilePage /></DashboardLayout>} />
        <Route path="/password" element={<DashboardLayout><Password /></DashboardLayout>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Detail Employee Page */}
        <Route path="/user/:id" element={<DashboardLayout><UserDetail /></DashboardLayout>} />

        {/* Employee Role Dashboard */}
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
