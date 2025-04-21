const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authenticateEmployee = require('../middleware/authenticateEmployee');
const { checkBlacklistedToken, blacklistedTokens } = require('../middleware/checkBlacklistedToken');
const { route } = require('./resetPasswordRoutes');
const { uploadProfilePhoto } = require('../utils/multerConfig');
// const upload = require('../utils/multerConfig');

router.post('/register', employeeController.registerEmployee);
router.post('/login', employeeController.loginEmployee);
router.post('/logout', authenticateEmployee, employeeController.logoutEmployee);
router.get('/me', authenticateEmployee, checkBlacklistedToken, employeeController.personalDataEmployee);
router.put('/edit', authenticateEmployee, checkBlacklistedToken, uploadProfilePhoto.single('file'), employeeController.editProfileEmployee);
router.post('/education/add', authenticateEmployee, employeeController.addEducation);
router.delete('/education/delete/:id', authenticateEmployee, employeeController.deleteEducation);
router.post('/training/add', authenticateEmployee, employeeController.addTraining);
router.delete('/training/delete/:id', authenticateEmployee, employeeController.deleteTraining);
router.post('/check-in', authenticateEmployee, employeeController.checkIn);
router.post('/check-out', authenticateEmployee, employeeController.checkOut);
router.post('/leave-request', authenticateEmployee, employeeController.leaveRequest);
router.get('/salary-slip', authenticateEmployee, employeeController.salarySlip);

module.exports = router;