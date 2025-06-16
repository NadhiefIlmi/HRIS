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
const Announcement = require('../models/Announcement');

exports.registerEmployee = async (req, res) => {
    console.log("Received request body:", req.body);
    console.log("Received file:", req.file); // <-- log file untuk debugging

    const {
        username, nik, employee_name, joint_date, contract_end_date, dob, pob,
        ktp_number, kk_number, npwp_number, gender, bpjs_kesehatan_no,
        bpjs_clinic, bpjs_tk_no, bpjs_jp_no, phone_nmb, email,
        ktp_address, salarySlip, password, attendanceRecords,
        leaveInfo, leaveRecords, department
    } = req.body;


    // educationHistory dan trainingHistory dari string -> JSON (jika dikirim dari form-data)
    let educationHistory = [];
    let trainingHistory = [];
    try {
        if (req.body.educationHistory) {
            educationHistory = JSON.parse(req.body.educationHistory);
        }
        if (req.body.trainingHistory) {
            trainingHistory = JSON.parse(req.body.trainingHistory);
        }
    } catch (err) {
        return res.status(400).json({ message: 'educationHistory/trainingHistory harus berupa JSON yang valid' });
    }

    // Validasi minimal field yang wajib diisi
    if (!username || !nik || !dob || !password || !gender || !joint_date || !employee_name || !email) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Parse leaveInfo if sent as JSON string
    let parsedLeaveInfo = {};
    try {
        if (leaveInfo) {
            parsedLeaveInfo = typeof leaveInfo === 'string' ? JSON.parse(leaveInfo) : leaveInfo;
        }
    } catch (err) {
        return res.status(400).json({ message: 'leaveInfo harus berupa JSON yang valid' });
    }

    // Set default totalAnnualLeave if not provided
    if (!parsedLeaveInfo.totalAnnualLeave) {
        parsedLeaveInfo.totalAnnualLeave = 12; // default value
    }
    // Set default usedAnnualLeave if not provided
    if (parsedLeaveInfo.usedAnnualLeave === undefined) {
        parsedLeaveInfo.usedAnnualLeave = 0;
    }
    // Ensure remainingAnnualLeave matches totalAnnualLeave if not explicitly set or mismatched
    if (
        parsedLeaveInfo.remainingAnnualLeave === undefined ||
        parsedLeaveInfo.remainingAnnualLeave === 12 && parsedLeaveInfo.totalAnnualLeave !== 12
    ) {
        parsedLeaveInfo.remainingAnnualLeave = parsedLeaveInfo.totalAnnualLeave;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newEmployee = new Employee({
            username,
            nik,
            employee_name,
            joint_date,
            contract_end_date,
            dob,
            pob,
            ktp_number,
            kk_number,
            npwp_number,
            gender,
            department,
            bpjs_kesehatan_no,
            bpjs_clinic,
            bpjs_tk_no,
            bpjs_jp_no,
            phone_nmb,
            email,
            photo: req.file ? req.file.filename : undefined, // <-- simpan nama file kalau ada
            ktp_address,
            educationHistory,
            trainingHistory,
            salarySlip,
            password: hashedPassword,
            attendanceRecords,
            leaveInfo: parsedLeaveInfo,
            leaveRecords
        });

        await newEmployee.save();
        res.json({ message: 'Employee registered successfully' });
    } catch (err) {
        console.error("Error in registerEmployee:", err);
        res.status(500).json({ message: 'Error registering employee' });
    }
};


exports.bulkRegisterEmployees = async (req, res) => {
  const employees = req.body;

  if (!Array.isArray(employees) || employees.length === 0) {
    return res.status(400).json({ message: 'Invalid or empty employee list' });
  }

  try {
    const newEmployees = await Promise.all(
      employees.map(async (emp) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(emp.password || 'DefaultPass123', salt); // Bisa diubah sesuai kebutuhan

        return {
          username: emp.username || emp.username_final,
          nik: emp.nik || emp.NIK,
          employee_name: emp.employee_name || emp['Employee Name'],
          joint_date: emp.joint_date || emp['Joint Date'],
          contract_end_date: emp.contract_end_date || emp['Contract End date'],
          dob: emp.dob || emp['Date of Birth'],
          pob: emp.pob || emp['Place of Birth'],
          ktp_number: emp.ktp_number || emp['KTP Number'],
          kk_number: emp.kk_number || emp['KK No'],
          npwp_number: emp.npwp_number || emp['NPWP Number'],
          gender:
            (emp.gender || emp['Gender'] || '').toLowerCase() === 'l'
              ? 'male'
              : (emp.gender || emp['Gender'] || '').toLowerCase() === 'p'
              ? 'female'
              : emp.gender || '',
          bpjs_kesehatan_no: emp.bpjs_kesehatan_no || emp['BPJS Kesehatan No'],
          bpjs_clinic: emp.bpjs_clinic || emp['BPJS Clinic'],
          bpjs_tk_no: emp.bpjs_tk_no || emp['BPJS TK No'],
          bpjs_jp_no: emp.bpjs_jp_no || emp['BPJS JP No'],
          phone_nmb: emp.phone_nmb || emp['No HP'],
          email: emp.email || emp['Email'],
          photo: emp.photo || '',
          ktp_address: emp.ktp_address || emp['KTP Address'],
          educationHistory: emp.educationHistory || [
            {
              last_education: emp['Last Education'],
              institution: emp['School / Univercity'],
              majority: emp['Majority'],
              year_of_graduation: emp['Year of Graduation'],
            },
          ],
          trainingHistory: emp.trainingHistory || [],
          salarySlip: emp.salarySlip || '',
          password: hashedPassword,
          attendanceRecords: [],
          leaveInfo: [],
          leaveRecords: [],
        };
      })
    );

    await Employee.insertMany(newEmployees);

    res.status(201).json({
      message: 'Employees registered successfully',
      insertedCount: newEmployees.length,
    });
  } catch (err) {
    console.error('Error in bulkRegisterEmployees:', err);
    res.status(500).json({ message: 'Failed to register employees', error: err.message });
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

exports.checkIn = async (req, res) => {
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
  
      // Hitung awal dan akhir hari ini
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
  
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
  
      // Cari apakah sudah ada attendance hari ini
      const todayAttendance = await Attendance.findOne({
        _id: { $in: employee.attendanceRecords },
        checkIn: { $gte: startOfToday, $lte: endOfToday }
      });
  
      if (todayAttendance) {
        return res.status(400).json({ message: 'You have already checked in today.' });
      }
  
      // Buat dokumen Attendance baru
      const newAttendance = new Attendance({ checkIn: new Date() });
      await newAttendance.save();
  
      // Tambahkan ke employee
      employee.attendanceRecords.push(newAttendance._id);
      await employee.save();
  
      res.status(201).json({ message: 'Check-in recorded successfully', attendance: newAttendance });
    } catch (error) {
      console.error('Check-in error:', error);
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

exports.getTodayAttendance = async (req, res) => {
    try {
      const employee = await Employee.findById(req.employee._id).populate('attendanceRecords');
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const todayAttendance = employee.attendanceRecords
        .map(record => record instanceof mongoose.Document ? record : null)
        .filter(record => record?.checkIn && new Date(record.checkIn).setHours(0, 0, 0, 0) === today.getTime());
  
      if (todayAttendance.length === 0) {
        return res.json({ checkIn: null, checkOut: null });
      }
  
      const attendance = todayAttendance[todayAttendance.length - 1];
      res.json({
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        workHours: attendance.workHours
      });
    } catch (error) {
      console.error('Error getting today attendance:', error);
      res.status(500).json({ message: 'Internal server error', error });
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

        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // FIX: Pastikan leaveInfo ada dan ter-initialize dengan benar
        if (!employee.leaveInfo) {
            employee.leaveInfo = {
                totalAnnualLeave: 12,
                usedAnnualLeave: 0,
                remainingAnnualLeave: 12
            };
            await employee.save();
        }

      // Cek jika cuti tahunan yang diajukan lebih besar dari sisa cuti yang tersedia
        if (type === 'annual' && totalDays > employee.leaveInfo.remainingAnnualLeave) {
            return res.status(400).json({ 
                message: `Not enough leave balance. You have ${employee.leaveInfo.remainingAnnualLeave} days remaining, but requested ${totalDays} days.` 
            });
        }

        const leaveRequest = new LeaveRequest({
            employeeId: req.employee._id,
            type,
            startDate,
            endDate,
            reason,
            totalDays 
        });

        await leaveRequest.save();
        await Employee.findByIdAndUpdate(
            req.employee._id,
            { $push: { leaveRecords: leaveRequest._id } }, 
            { new: true }
        );

        const hrEmail = process.env.HR_EMAIL; // Atau ambil dari database jika ada banyak HR
        const leaveDetails = `Type: ${type}\nStart: ${startDate}\nEnd: ${endDate}\nReason: ${reason}\nTotal Days: ${totalDays}`;
        await sendLeaveNotification(hrEmail, employee.username, leaveDetails);
        res.status(201).json({ 
            message: 'Leave request submitted successfully', 
            leaveRequest,
            totalDays: totalDays
        });

    } catch (error) {
        console.error("Leave request error:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Controller untuk melihat permintaan cuti yang sudah diajukan oleh karyawan
exports.getLeaveRequests = async (req, res) => {
    try {
        const leaveRequests = await LeaveRequest.find({ employeeId: req.employee._id })
            .populate('employeeId', 'username')
            .exec();

        // Jangan kembalikan status 404 jika kosong
        res.status(200).json({ leaveRequests });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};


// Controller untuk menghapus permintaan cuti
exports.deleteLeaveRequest = async (req, res) => {
    try {
        const leaveRequest = await LeaveRequest.findById(req.params.id);
        
        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found.' });
        }

        // Menghapus permintaan cuti tanpa memeriksa status
        await LeaveRequest.findByIdAndDelete(req.params.id);
        await Employee.findByIdAndUpdate(
            req.employee._id,
            { $pull: { leaveRecords: req.params.id } },
            { new: true }
        );

        res.status(200).json({ message: 'Leave request deleted successfully.' });
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

exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const employeeId = req.employee._id;
  
    try {
      console.log(`Request received to change password for Employee ID: ${employeeId}`);
  
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        console.error('Employee not found');
        return res.status(404).json({ message: 'Employee tidak ditemukan' });
      }
  
      console.log('Comparing old password...');
      const isMatch = await bcrypt.compare(oldPassword, employee.password);
      if (!isMatch) {
        console.error('Old password does not match');
        return res.status(400).json({ message: 'Password lama tidak sesuai' });
      }
  
      console.log('Hashing new password...');
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      employee.password = hashedNewPassword;
  
      await employee.save();
      console.log('Password updated successfully');
  
      res.json({ message: 'Password berhasil diubah' });
    } catch (err) {
      console.error('Error during password change:', err);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  };

 // GET /api/employee/attendance/history
exports.getAttendanceHistory = async (req, res) => {
    try {
      const employee = await Employee.findById(req.employee._id).populate({
        path: 'attendanceRecords',
        options: { sort: { checkIn: -1 } } // Urutkan dari terbaru
      });
  
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      res.json(employee.attendanceRecords);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  };
  


// Get announcements for a specific date
exports.getAnnouncementsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const announcements = await Announcement.find({
      date: new Date(date)
    }).sort({ time: 1 }).populate('createdBy', 'username');

    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements by date:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get upcoming announcements
exports.getUpcomingAnnouncements = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const announcements = await Announcement.find({
      date: { $gte: today }
    }).sort({ date: 1, time: 1 })
      .limit(5)
      .populate('createdBy', 'username');

    res.json(announcements);
  } catch (error) {
    console.error('Error fetching upcoming announcements:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// New controller to get leave information of logged-in employee
exports.getLeaveInfo = async (req, res) => {
  try {
    const employeeId = req.employee._id;
    const employee = await Employee.findById(employeeId).select('leaveInfo');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee.leaveInfo);
  } catch (error) {
    console.error('Error fetching leave info:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
