const express = require('express');
const router = express.Router();
const {
    requestResetPassword,
    resetPassword
} = require('../controllers/resetPasswordController');

router.post('/request-reset-password', requestResetPassword);
router.post('/reset-password', resetPassword);

module.exports = router;