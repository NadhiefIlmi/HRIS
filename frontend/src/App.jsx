import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import HRDashboard from './pages/HRDashboard';
import EmployeesPage from './pages/EmployeesPage';
import LeaveRequestsPage from './pages/LeaveRequestsPage';
import UploadSalaryPage from './pages/UploadSalaryPage';
import ProfilePage from './pages/ProfilePage';
import EmployeeDashboard from './layouts/EmployeeDashboard'; // Updated route

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
        <Route path="/upload-salary" element={<DashboardLayout><UploadSalaryPage /></DashboardLayout>} />
        <Route path="/profile" element={<DashboardLayout><ProfilePage /></DashboardLayout>} />

        {/* Employee Role Dashboard */}
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} /> {/* Ganti ke employee-dashboard */}
      </Routes>
    </Router>
  );
}

export default App;
