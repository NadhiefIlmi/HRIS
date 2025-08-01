const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authenticateEmployee = require('../middleware/authenticateEmployee');
const { checkBlacklistedToken, blacklistedTokens } = require('../middleware/checkBlacklistedToken');
const { uploadProfilePhoto } = require('../utils/multerConfig');

router.post('/register', uploadProfilePhoto.single('photo'), employeeController.registerEmployee);
router.post('/login', employeeController.loginEmployee);
router.post('/logout', authenticateEmployee, employeeController.logoutEmployee);

router.get('/me', authenticateEmployee, checkBlacklistedToken, employeeController.personalDataEmployee);
router.put('/edit', authenticateEmployee, checkBlacklistedToken, uploadProfilePhoto.single('file'), employeeController.editProfileEmployee);

router.post('/check-in', authenticateEmployee, employeeController.checkIn);
router.post('/check-out', authenticateEmployee, employeeController.checkOut);

router.post('/leave-request', authenticateEmployee, employeeController.leaveRequest);
router.get('/leave-requests/status', authenticateEmployee, employeeController.getLeaveRequests);  // Endpoint untuk melihat permintaan cuti
router.delete('/leave-request/:id', authenticateEmployee, employeeController.deleteLeaveRequest);  // Endpoint untuk menghapus permintaan cuti
router.get('/leave-info', authenticateEmployee, employeeController.getLeaveInfo);

router.get('/salary-slip', authenticateEmployee, employeeController.salarySlip);
router.get('/salary-slip/download', authenticateEmployee, employeeController.downloadSalarySlipToClient);

router.put('/change-password', authenticateEmployee,  employeeController.changePassword);

router.get('/attendance/today', authenticateEmployee, employeeController.getTodayAttendance);
router.get('/attendance/history', authenticateEmployee, employeeController.getAttendanceHistory);

router.get('/announcements/date/:date', authenticateEmployee, employeeController.getAnnouncementsByDate);
router.get('/announcements/upcoming', authenticateEmployee, employeeController.getUpcomingAnnouncements);

// router.post('/education/add', authenticateEmployee, employeeController.addEducation);
// router.delete('/education/delete/:id', authenticateEmployee, employeeController.deleteEducation);
// router.post('/training/add', authenticateEmployee, employeeController.addTraining);
// router.delete('/training/delete/:id', authenticateEmployee, employeeController.deleteTraining);

module.exports = router;
