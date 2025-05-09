const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['sick', 'annual', 'personal', 'maternity', 'other'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },  // Status cuti
    requestedAt: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'HR', default: null }  // HR yang menyetujui jika diperlukan
});

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
