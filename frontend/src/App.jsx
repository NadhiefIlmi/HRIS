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
import EmployeeLayout from './layouts/EmployeeLayout'; // Employee route
import UserDetail from './pages/UserDetail'; // ✅ Tambahkan ini
import AddEmployee from './pages/AddEmployee'; // Import AddEmployee
import Password from './pages/Password'; // Import Password page
import ForgotPassword from './pages/ForgotPasswordPage'; // Import Password page
import ProfileEmployee from './pages/ProfileEmployee';
import EducationHistory from './pages/EducationHistory';
import TrainingHistory from './pages/TrainingHistory';
import SalarySlip from './pages/SalarySlip';
import LeavePermission from './pages/LeavePermission';
import PasswordEmployee from "./pages/PasswordEmployee";
import EmployeeDashboard from './pages/EmployeeDashboard';
import AttendanceHistory from './pages/AttendanceHistory';

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
        <Route path="/employee-dashboard" element={<EmployeeLayout><EmployeeDashboard /></EmployeeLayout>} />
        <Route path="/employee/profile" element={<EmployeeLayout><ProfileEmployee /></EmployeeLayout>} />
        <Route path="/employee/education" element={<EmployeeLayout><EducationHistory /></EmployeeLayout>} />
        <Route path="/employee/training" element={<EmployeeLayout><TrainingHistory /></EmployeeLayout>} />
        <Route path="/employee/salary-slip" element={<EmployeeLayout><SalarySlip /></EmployeeLayout>} />
        <Route path="/employee/leave" element={<EmployeeLayout><LeavePermission /></EmployeeLayout>} />
        <Route path="/change-password" element={<EmployeeLayout><PasswordEmployee/></EmployeeLayout>} />
        <Route path="/employee/attendance" element={<EmployeeLayout><AttendanceHistory/></EmployeeLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
