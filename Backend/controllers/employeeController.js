const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { blacklistedTokens } = require('../middleware/checkBlacklistedToken');
const { sendLeaveNotification } = require('../utils/emailConfig');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');


exports.registerEmployee = async (req, res) => {
    const { username, nik, dob, department, password, gender } = req.body;
    if (!username || !nik || !dob || !department || !password || !gender) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newEmployee = new Employee({
            username, nik, dob, department, gender, password: hashedPassword
        });
        await newEmployee.save();
        res.json({ message: 'Employee registered successfully' });
    } catch (err) {
        console.error("Error in registerEmployee:", err); // Log error
        res.status(500).json({ message: 'Error registering Employee' });
    }
};

exports.loginEmployee = async (req, res) => {
    const { username, password } = req.body;
    try {
        const employee = await Employee.findOne({ username });
        if (!employee) return res.status(400).json({ message: 'Employee not found' });

        const validPass = await bcrypt.compare(password, employee.password);
        if (!validPass) return res.status(400).json({ message: 'Invalid password' });

        // Pastikan _id adalah string
        const token = jwt.sign(
            { _id: String(employee._id), role: 'employee' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log("Generated Token:", token);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// **Karyawan Melihat Profil Mereka Sendiri**
exports.personalDataEmployee = async (req, res) => {
    try {
        const employeeId = req.employee._id;
        console.log("[Endpoint] Employee ID from token:", employeeId);

        // Langsung cari dengan _id string tanpa validasi ObjectId
        const employee = await Employee.findById(employeeId, {})
            .populate('attendanceRecords')
            .populate('leaveRecords') 
            .select('-password'); 

        if (!employee) {
            console.log("[Endpoint] Employee not found:", employeeId);
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (err) {
        console.log("[Endpoint] Error:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.editProfileEmployee =  async (req, res) => {
    try {
        const employeeId = req.employee._id;
        const { username, nik, email, phone_nmb, gender, dob, department, educationHistory, trainingHistory } = req.body;

        // Cek apakah employee dengan ID tersebut ada
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Update data hanya jika dikirim di request body
        if (username !== undefined) employee.username = username;
        if (nik !== undefined) employee.nik = nik;
        if (email !== undefined) employee.email = email;
        if (dob !== undefined) employee.dob = dob;
        if (phone_nmb !== undefined) employee.phone_nmb = phone_nmb;
        if (gender !== undefined) employee.gender = gender;
        if (department !== undefined) employee.department = department;
        if (req.file !== undefined) {
            if (employee.photo) {
                const oldPath = path.join(__dirname, '..', employee.photo); // path relatif
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            employee.photo = `/uploads/profile-photos/${req.file.filename}`;
        }
        // Update atau kosongkan riwayat pendidikan & training
        if (Array.isArray(educationHistory)) {
            employee.educationHistory = educationHistory; // Bisa kosong []
        }
        if (Array.isArray(trainingHistory)) {
            employee.trainingHistory = trainingHistory; // Bisa kosong []
        }

        await employee.save();
        res.json({ message: 'Employee profile updated successfully', employee });
    } catch (err) {
        console.log("[Endpoint] Error updating Employee profile:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.addEducation =  async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const { degree, institution, year } = req.body;

        // Validasi input minimal satu beda
        if (!degree && !institution && !year) {
            return res.status(400).json({ message: 'At least one of degree, institution, or year must be provided' });
        }

        // Validasi input tidak masuk akal (misal tahun ke depan atau sebelum 1900)
        const currentYear = new Date().getFullYear();
        if (year && (year > currentYear || year < 1900)) {
            return res.status(400).json({ message: 'Year is not valid' });
        }

        // Cek duplikasi berdasarkan ketiganya (case-insensitive)
        const isDuplicate = employee.educationHistory.some(edu =>
            edu.degree?.toLowerCase() === degree?.toLowerCase() &&
            edu.institution?.toLowerCase() === institution?.toLowerCase() &&
            edu.year === year
        );

        if (isDuplicate) {
            return res.status(409).json({ message: 'Education record already exists' });
        }

        const newEducation = { _id: new mongoose.Types.ObjectId(), degree, institution, year };
        employee.educationHistory.push(newEducation);

        await employee.save();
        res.json({ message: 'Education added', education: newEducation });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err });
    }
};

exports.deleteEducation =  async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const educationId = req.params.id;
        employee.educationHistory = employee.educationHistory.filter(ed => ed._id.toString() !== educationId);

        await employee.save();
        res.json({ message: 'Education deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err });
    }
};

exports.addTraining =  async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const { title, provider, date } = req.body;

        // Validasi minimal ada satu field yang beda
        if (!title && !provider && !date) {
            return res.status(400).json({ message: 'At least one of title, provider, or date must be provided' });
        }

        // Cek duplikasi
        const isDuplicate = employee.trainingHistory.some(training =>
            training.title?.toLowerCase() === title?.toLowerCase() &&
            training.provider?.toLowerCase() === provider?.toLowerCase() &&
            new Date(training.date).toISOString() === new Date(date).toISOString()
        );

        if (isDuplicate) {
            return res.status(409).json({ message: 'Training record already exists' });
        }

        const newTraining = { _id: new mongoose.Types.ObjectId(), title, provider, date };
        employee.trainingHistory.push(newTraining);

        await employee.save();
        res.json({ message: 'Training added', training: newTraining });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err });
    }
};


exports.deleteTraining =  async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const trainingId = req.params.id;
        employee.trainingHistory = employee.trainingHistory.filter(tr => tr._id.toString() !== trainingId);

        await employee.save();
        res.json({ message: 'Training deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err });
    }
};

exports.checkIn =  async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id).populate('attendanceRecords');
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Cek apakah sudah check-in tetapi belum check-out
        const lastAttendance = employee.attendanceRecords.length > 0 
            ? await Attendance.findById(employee.attendanceRecords[employee.attendanceRecords.length - 1])
            : null;

        if (lastAttendance && !lastAttendance.checkOut) {
            return res.status(400).json({ message: 'You have already checked in but not checked out yet.' });
        }

        // Buat dokumen Attendance baru
        const newAttendance = new Attendance({ checkIn: new Date() });
        await newAttendance.save();

        // Tambahkan ke employee
        employee.attendanceRecords.push(newAttendance._id);
        await employee.save();

        res.status(201).json({ message: 'Check-in recorded successfully', attendance: newAttendance });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

exports.checkOut =  async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id).populate('attendanceRecords');
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Ambil ID terakhir dari attendanceRecords
        const lastAttendanceId = employee.attendanceRecords[employee.attendanceRecords.length - 1];
        if (!lastAttendanceId) {
            return res.status(400).json({ message: 'No active check-in record found. Please check in first.' });
        }

        // Cari dokumen Attendance berdasarkan ID
        const lastAttendance = await Attendance.findById(lastAttendanceId);
        if (!lastAttendance || !lastAttendance.checkIn || lastAttendance.checkOut) {
            return res.status(400).json({ message: 'No active check-in record found. Please check in first.' });
        }

        // Hitung jam kerja
        const checkOutTime = new Date();
        const checkInTime = new Date(lastAttendance.checkIn);
        const workHours = ((checkOutTime - checkInTime) / 3600000).toFixed(2);

        // Update dokumen Attendance
        lastAttendance.checkOut = checkOutTime;
        lastAttendance.workHours = parseFloat(workHours);
        await lastAttendance.save();

        res.json({ message: 'Check-out recorded successfully', attendance: lastAttendance });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

exports.leaveRequest =  async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        if (!type || !startDate || !endDate) {
            return res.status(400).json({ message: 'Type, start date, and end date are required.' });
        }

        const allowedLeaveTypes = ['sick', 'annual', 'personal', 'maternity', 'other'];
        if (!allowedLeaveTypes.includes(type)) {
            return res.status(400).json({ message: `Invalid leave type. Allowed types: ${allowedLeaveTypes.join(', ')}` });
        }

        const employee = await Employee.findById(req.employee._id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

        // Cek jika cuti tahunan yang diajukan lebih besar dari sisa cuti yang tersedia
        if (type === 'annual' && totalDays > employee.leaveInfo.remainingAnnualLeave) {
            return res.status(400).json({ message: 'Not enough leave balance.' });
        }

        const leaveRequest = new LeaveRequest({
            employeeId: req.employee._id,
            type,
            startDate,
            endDate,
            reason
        });

        await leaveRequest.save();
        await Employee.findByIdAndUpdate(
            req.employee._id,
            { $push: { leaveRecords: leaveRequest._id } }, 
            { new: true }
        );

        const hrEmail = process.env.HR_EMAIL; // Atau ambil dari database jika ada banyak HR
        const leaveDetails = `Type: ${type}\nStart: ${startDate}\nEnd: ${endDate}\nReason: ${reason}`;
        await sendLeaveNotification(hrEmail, employee.username, leaveDetails);
        res.status(201).json({ message: 'Leave request submitted successfully', leaveRequest });

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

exports.salarySlip =  async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id);
        console.log(employee);
        if (!employee || !employee.salarySlip) {
            return res.status(404).json({ message: 'No salary slip available' });
        }

        // Pastikan URL bisa diakses dari browser
        res.json({ salarySlip: encodeURI(`${req.protocol}://${req.get('host')}${employee.salarySlip}`) });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

exports.downloadSalarySlipToClient = async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id);
        if (!employee || !employee.salarySlip) {
            return res.status(404).json({ message: 'No salary slip available' });
        }

        const slipPath = path.join(__dirname, '../utils', employee.salarySlip); // Sesuaikan dengan lokasi penyimpanan file
        const fileName = path.basename(employee.salarySlip);

        // Cek apakah file ada
        res.download(slipPath, fileName, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to download file', error: err.message });
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

exports.logoutEmployee =  (req, res) => {
    const token = req.header('Authorization');
    blacklistedTokens.add(token);
    res.json({ message: 'Logged out successfully' });
};
