const express = require('express');
const router = express.Router();
const hrController = require('../controllers/HRController');
const authenticateHR = require('../middleware/authenticateHR');
const { checkBlacklistedToken, blacklistedTokens } = require('../middleware/checkBlacklistedToken');
const { uploadProfilePhoto, uploadSalarySlip, uploadSalarySlipZip, uploadEmployeeExcel } = require('../utils/multerConfig');
const { changePassword } = require('../controllers/HRController');

router.post('/login', hrController.loginHR);
router.post('/logout', authenticateHR, hrController.logoutHR);
router.get('/me', authenticateHR, checkBlacklistedToken, hrController.personalDataHR);

router.get('/employee', authenticateHR, checkBlacklistedToken, hrController.getAllEmployee);
router.delete('/deleteEmployee/:id', authenticateHR, checkBlacklistedToken, hrController.deleteEmployee);
router.delete('/deleteAllEmployees', authenticateHR, checkBlacklistedToken, hrController.deleteAllEmployees); // FOR DEVELOPMENT PURPOSE
router.put('/edit', authenticateHR, checkBlacklistedToken, uploadProfilePhoto.single('file'), hrController.editProfileHR);

router.put('/approve-leave/:id', authenticateHR, hrController.leaveApproval);
router.get('/leave-requests', authenticateHR, hrController.viewLeaveRequest);
router.get('/leave-requests/pending', authenticateHR, hrController.viewPendingLeaveRequest);

router.get('/count-employees', authenticateHR, checkBlacklistedToken, hrController.countEmployees);
router.get('/count-pending-leaves', authenticateHR, checkBlacklistedToken, hrController.countPendingLeaveRequests);
router.post('/change-password', authenticateHR, hrController.changePassword);
router.get('/gender-summary', authenticateHR, checkBlacklistedToken, hrController.getGenderSummary);
router.put('/employee/edit/:id', authenticateHR, checkBlacklistedToken, uploadProfilePhoto.single('file'), hrController.editProfileEmployeeByHR);
router.get('/department-distribution', authenticateHR, checkBlacklistedToken, hrController.getDepartmentDistribution);

router.post('/announcements', authenticateHR, checkBlacklistedToken, hrController.createAnnouncement);
router.get('/announcements/date/:date', authenticateHR, checkBlacklistedToken, hrController.getAnnouncementsByDate);
router.get('/announcements/upcoming', authenticateHR, checkBlacklistedToken, hrController.getUpcomingAnnouncements);
router.delete('/announcements/:id', authenticateHR, checkBlacklistedToken, hrController.deleteAnnouncement);

router.post('/upload-employee-excel', authenticateHR, uploadEmployeeExcel.single('file'), hrController.uploadExcelEmployees);
router.post('/upload-zip-slip', authenticateHR, checkBlacklistedToken, uploadSalarySlipZip.single('zipfile'), hrController.uploadSalarySlipZip);
router.post('/upload-salary-slip/:employeeId', authenticateHR, uploadSalarySlip.single('salarySlip'), hrController.uploadSalarySlip);
router.get('/salary-slip/:employeeId', authenticateHR, hrController.getSalarySlips);

router.get('/attendance-history/:id', authenticateHR, checkBlacklistedToken, hrController.getEmployeeAttendanceHistory);

module.exports = router;
