import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './pages/ProtectedRoute';
import NotAuthorized from './pages/NotAuthorized';

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
import EditProfileEmployee from './pages/hrPages/EditProfileEmployee';
import AddExcell from './pages/hrPages/AddExcell';
import HrAttendanceHistory from './pages/hrPages/HrAttendanceHistory';

import EmployeeHome from './pages/employeePages/EmployeeHome';
import ProfileEmployee from './pages/employeePages/ProfileEmployee';
import ChangePasswordEmployee from './pages/employeePages/ChangePasswordEmployee';
import EducationHistory from './pages/employeePages/EducationHistory';
import TrainingHistory from './pages/employeePages/TrainingHistory';
import EmployeeSalarySlip from './pages/employeePages/EmployeeSalarySlip';
import LeavePermission from './pages/employeePages/LeavePermission';
import AttendanceHistory from './pages/employeePages/AttendanceHistory';

import AdminDashboard from './pages/adminPage/AdminDashboard';
import AdminLogin from './pages/adminPage/AdminLogin';

function App() {
  return (
    <Router>
      {/* Toast for all pages */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route 
          path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
        />

        {/* HR Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['hr']}>
            <HRLayout>
              <HRHome />
            </HRLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employees" 
          element={
            <ProtectedRoute allowedRoles={['hr']}>
            <HRLayout>
              <EmployeesPage />
            </HRLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leave-requests" 
          element={
            <ProtectedRoute allowedRoles={['hr']}>
            <HRLayout>
              <LeaveRequestsPage />
            </HRLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employees/add" 
          element={
            <ProtectedRoute allowedRoles={['hr']}>
            <HRLayout>
              <AddEmployee />
            </HRLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employees/add-excell" 
          element={
            <ProtectedRoute allowedRoles={['hr']}>
            <HRLayout>
              <AddExcell />
            </HRLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Profile" 
          element={
            <ProtectedRoute allowedRoles={['hr']}>
            <HRLayout>
              <HRProfile />
            </HRLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/password" 
          element={
            <ProtectedRoute allowedRoles={['hr']}>
            <HRLayout>
              <ChangePasswordHR />
            </HRLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/detail/:id" 
          element={
            <ProtectedRoute allowedRoles={['hr']}>
            <HRLayout>
              <EditProfileEmployee />
            </HRLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/:id" 
          element={
            <ProtectedRoute allowedRoles={['hr']}>
            <HRLayout>
              <EmployeeDetail />
            </HRLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/attendance/:id" 
          element={
            <ProtectedRoute allowedRoles={['hr']}>
            <HRLayout>
              <HrAttendanceHistory />
            </HRLayout>
            </ProtectedRoute>
          } 
        />

        {/* Employee Protected Routes */}
        <Route 
          path="/employee-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <EmployeeHome />
            </EmployeeLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/profile" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <ProfileEmployee />
            </EmployeeLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/education" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <EducationHistory />
            </EmployeeLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/training" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <TrainingHistory />
            </EmployeeLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/salary-slip" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <EmployeeSalarySlip />
            </EmployeeLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/leave" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <LeavePermission />
            </EmployeeLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/change-password" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <ChangePasswordEmployee />
            </EmployeeLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/attendance" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout>
              <AttendanceHistory />
            </EmployeeLayout>
            </ProtectedRoute>
          } 
        />

        {/* Not Authorized route */}
        <Route path="/not-authorized" element={<NotAuthorized />} />
      </Routes>
    </Router>
  );
}

export default App;
