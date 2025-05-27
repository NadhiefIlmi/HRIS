const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
    last_education: {
        type: String,
        enum: ['SMK SEDERAJAT', 'SMA SEDERAJAT', 'S1'],
        required: true
    },
    institution: String,
    majority: String,
    year_of_graduation: Number
}, { _id: true });

const TrainingSchema = new mongoose.Schema({
    title: String,
    provider: String,
    date: Date
}, { _id: true });

const EmployeeSchema = new mongoose.Schema({
    username: String,
    nik: String,
    employee_name: String,
    joint_date: Date,
    contract_end_date: Date,
    dob: Date,
    pob: String,
    ktp_number: String,
    kk_number: String,
    npwp_number: String,
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    }, 
    bpjs_kesehatan_no: String,
    bpjs_clinic: String,
    bpjs_tk_no: String,
    bpjs_jp_no: String,
    department: String,
    phone_nmb: String,
    email: String,
    photo: { type: String, default: '' },
    educationHistory: [EducationSchema],
    ktp_address: String,
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