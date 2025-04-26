const express = require('express');
const router = express.Router();
const hrController = require('../controllers/HRController');
const authenticateHR = require('../middleware/authenticateHR');
const { checkBlacklistedToken, blacklistedTokens } = require('../middleware/checkBlacklistedToken');
const { uploadProfilePhoto, uploadSalarySlip } = require('../utils/multerConfig');
const { changePassword } = require('../controllers/HRController');


router.post('/register', hrController.registerHR);
router.post('/login', hrController.loginHR);
router.post('/logout', authenticateHR, hrController.logoutHR);
router.get('/me', authenticateHR, checkBlacklistedToken, hrController.personalDataHR);
router.get('/employee', authenticateHR, checkBlacklistedToken, hrController.getAllEmployee);
router.delete('/deleteEmployee/:id', authenticateHR, checkBlacklistedToken, hrController.deleteEmployee);
router.get('/', authenticateHR, checkBlacklistedToken, hrController.getAllHR);
router.put('/edit', authenticateHR, checkBlacklistedToken, uploadProfilePhoto.single('file'), hrController.editProfileHR);
router.put('/approve-leave/:id', authenticateHR, hrController.leaveApproval);
router.get('/leave-requests', authenticateHR, hrController.viewLeaveRequest);
router.get('/leave-requests/pending', authenticateHR, hrController.viewPendingLeaveRequest);
router.post('/upload-salary-slip/:employeeId', authenticateHR, uploadSalarySlip.single('salarySlip'), hrController.uploadSalarySlip);
router.get('/count-employees', authenticateHR, checkBlacklistedToken, hrController.countEmployees);
router.get('/count-pending-leaves', authenticateHR, checkBlacklistedToken, hrController.countPendingLeaveRequests);
router.post('/change-password', authenticateHR, changePassword);
router.get('/gender-summary', authenticateHR, checkBlacklistedToken, hrController.getGenderSummary);


module.exports = router;
