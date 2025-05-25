import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HRLayout from './layouts/HRLayout';
import EmployeeLayout from './layouts/EmployeeLayout';

import HRHome from './pages/hrPages/HRHome';
import HRProfile from './pages/hrPages/HRProfile';
import EmployeesPage from './pages/hrPages/EmployeesPage';
import EmployeeDetail from './pages/hrPages/EmployeeDetail';
import AddEmployee from './pages/hrPages/AddEmployee';
import ChangePasswordHR from './pages/hrPages/ChangePasswordHR';
import LeaveRequestsPage from './pages/hrPages/LeaveRequestsPage';

import EmployeeHome from './pages/employeePages/EmployeeHome';
import ProfileEmployee from './pages/employeePages/ProfileEmployee';
import ChangePasswordEmployee from './pages/employeePages/ChangePasswordEmployee';
import EducationHistory from './pages/employeePages/EducationHistory';
import TrainingHistory from './pages/employeePages/TrainingHistory';
import EmployeeSalarySlip from './pages/employeePages/EmployeeSalarySlip';
import LeavePermission from './pages/employeePages/LeavePermission';
import AttendanceHistory from './pages/employeePages/AttendanceHistory';


// import HRDashboard from './pages/HRDashboard';
// import EmployeesPage from './pages/EmployeesPage';
// import LeaveRequestsPage from './pages/LeaveRequestsPage';
// import ProfilePage from './pages/ProfilePage';
// import EmployeeLayout from './layouts/EmployeeLayout'; // Employee route
// import UserDetail from './pages/UserDetail'; // ✅ Tambahkan ini
// import AddEmployee from './pages/AddEmployee'; // Import AddEmployee
// import Password from './pages/Password'; // Import Password page
// import ForgotPassword from './pages/ForgotPasswordPage'; // Import Password page
// import ProfileEmployee from './pages/ProfileEmployee';
// import EducationHistory from './pages/EducationHistory';
// import TrainingHistory from './pages/TrainingHistory';
// import SalarySlip from './pages/SalarySlip';
// import LeavePermission from './pages/LeavePermission';
// import PasswordEmployee from "./pages/PasswordEmployee";
// import EmployeeDashboard from './pages/EmployeeDashboard';
// import AttendanceHistory from './pages/AttendanceHistory';

function App() {
  return (
    <Router>
      {/* Toast for all pages */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* Login Page */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Pages under DashboardLayout (HR role) */}
        <Route path="/dashboard" element={<HRLayout><HRHome /></HRLayout>} />
        <Route path="/employees" element={<HRLayout><EmployeesPage /></HRLayout>} />
        <Route path="/leave-requests" element={<HRLayout><LeaveRequestsPage /></HRLayout>} />
        <Route path="/employees/add" element={<HRLayout><AddEmployee /></HRLayout>} />
        <Route path="/Profile" element={<HRLayout><HRProfile /></HRLayout>} />
        <Route path="/password" element={<HRLayout><ChangePasswordHR /></HRLayout>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Detail Employee Page */}
        <Route path="/user/:id" element={<HRLayout><EmployeeDetail /></HRLayout>} />

        {/* Employee Role Dashboard */}
        <Route path="/employee-dashboard" element={<EmployeeLayout><EmployeeHome /></EmployeeLayout>} />
        <Route path="/employee/profile" element={<EmployeeLayout><ProfileEmployee /></EmployeeLayout>} />
        <Route path="/employee/education" element={<EmployeeLayout><EducationHistory /></EmployeeLayout>} />
        <Route path="/employee/training" element={<EmployeeLayout><TrainingHistory /></EmployeeLayout>} />
        <Route path="/employee/salary-slip" element={<EmployeeLayout><EmployeeSalarySlip /></EmployeeLayout>} />
        <Route path="/employee/leave" element={<EmployeeLayout><LeavePermission /></EmployeeLayout>} />
        <Route path="/change-password" element={<EmployeeLayout><ChangePasswordEmployee/></EmployeeLayout>} />
        <Route path="/employee/attendance" element={<EmployeeLayout><AttendanceHistory/></EmployeeLayout>} />
      </Routes>
    </Router>
  );
}

export default App;