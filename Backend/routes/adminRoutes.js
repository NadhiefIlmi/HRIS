const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { checkBlacklistedToken, blacklistedTokens } = require('../middleware/checkBlacklistedToken');

router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);
router.post('/logout',adminController.logoutAdmin);
router.get('/', authenticateAdmin, checkBlacklistedToken, adminController.getAdmin);
router.get('/hr', authenticateAdmin, checkBlacklistedToken, adminController.getAllHR);
router.post('/hr/register', authenticateAdmin, checkBlacklistedToken, adminController.registerHR);
router.delete('/hr/delete/:id', authenticateAdmin, checkBlacklistedToken, adminController.deleteHR);

module.exports = router;