const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
    degree: String,
    institution: String,
    year: Number
}, { _id: true });

const TrainingSchema = new mongoose.Schema({
    title: String,
    provider: String,
    date: Date
}, { _id: true });

const EmployeeSchema = new mongoose.Schema({
    username: String,
    nik: String,
    email: String,
    dob: Date,
    department: String,
    phone_nmb: String,
    photo: { type: String, default: '' },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    }, 
    educationHistory: [EducationSchema],
    trainingHistory: [TrainingSchema],
    salarySlip: { type: String, default: '' },
    password: String,
    attendanceRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }],
    leaveInfo: { 
        totalAnnualLeave: { type: Number, default: 12 }, // Jumlah cuti tahunan yang tersedia
        usedAnnualLeave: { type: Number, default: 0 },  // Cuti yang sudah digunakan
        remainingAnnualLeave: { type: Number, default: 12 } // Sisa cuti
    },
    leaveRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest' }]
});

module.exports = mongoose.model('Employee',EmployeeSchema);