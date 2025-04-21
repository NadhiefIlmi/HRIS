const mongoose = require('mongoose');

const ResetTokenSchema = new mongoose.Schema({
    username: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    role: { type: String, enum: ['employee', 'hr'], required: true }
});
module.exports = mongoose.model('ResetToken', ResetTokenSchema);
