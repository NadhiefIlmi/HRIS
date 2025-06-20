const HR = require('../models/HR');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { blacklistedTokens } = require('../middleware/checkBlacklistedToken');
const LeaveRequest = require('../models/LeaveRequest');
const Announcement = require('../models/Announcement');
const unzipper = require('unzipper');
const path = require('path');
const fs = require('fs-extra');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rename = promisify(fs.rename);
const rmdir = promisify(fs.rmdir);
const xlsx = require('xlsx');

exports.registerHR = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const existingHR = await HR.findOne({ username });
        if (existingHR) {
            return res.status(409).json({ message: 'Username already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newHR = new HR({ username, password: hashedPassword });
        await newHR.save();
        res.json({ message: 'HR registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering HR' });
    }
};

exports.loginHR = async (req, res) => {
    const { username, password } = req.body;
    const hr = await HR.findOne({ username });
    if (!hr) return res.status(400).json({ message: 'User not found' });

    const validPass = await bcrypt.compare(password, hr.password);
    if (!validPass) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ _id: hr._id, role: 'hr' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
};

exports.logoutHR = (req, res) => {
    const token = req.header('Authorization');
    blacklistedTokens.add(token);
    res.json({ message: 'Logged out successfully' });
};

// **HR Melihat Profil Mereka Sendiri**
exports.personalDataHR = async (req, res) => {
    try {
        const hrId = req.hr._id;
        console.log("[Endpoint] HR ID from token:", hrId);

        if (!mongoose.Types.ObjectId.isValid(hrId)) {
            console.log("[Endpoint] HR ID is invalid:", hrId);
            return res.status(400).json({ message: 'Invalid HR ID' });
        }

        const hr = await HR.findById(hrId, {password:0}); // Jangan tampilkan password

        if (!hr) {
            console.log("[Endpoint] HR not found:", hrId);
            return res.status(404).json({ message: 'HR not found' });
        }

        res.json(hr);
    } catch (err) {
        console.log("[Endpoint] Error:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// **HR Bisa Melihat Semua Karyawan**
exports.getAllEmployee = async (req, res) => {
    try {
        const employees = await Employee.find({})
            .populate('attendanceRecords')
            .populate('leaveRecords') 
            .select('-password'); 

        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        // Cari employee berdasarkan NIK
        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        const deletedUsername = employee.username;
        // Hapus employee
        await Employee.deleteOne({ _id: id });

        res.json({ message: `Employee with username ${deletedUsername} deleted successfully` });
    } catch (err) {
        console.error("[Delete Employee] Error:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteAllEmployees = async (req, res) => {
    try {
        const result = await Employee.deleteMany({});
        res.json({ message: `All employees deleted successfully. Count: ${result.deletedCount}` });
    } catch (err) {
        console.error("[Delete All Employees] Error:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// **HR Bisa Melihat Semua Karyawan**
exports.getAllHR = async (req, res) => {
    const hr = await HR.find({}, { password: 0 });
    res.json(hr);
};

exports.editProfileEmployeeByHR = async (req, res) => {
    try {
        const { id } = req.params;

        let {
    username,
    employee_name,
    nik,
    email,
    phone_nmb,
    gender,
    dob,
    pob,
    ktp_number,
    kk_number,
    npwp_number,
    ktp_address,
    joint_date,
    contract_end_date,
    bpjs_kesehatan_no,
    bpjs_clinic,
    bpjs_tk_no,
    bpjs_jp_no,
    department,
    educationHistory,
    trainingHistory,
    leaveInfo, // Tambahan untuk leave info
} = req.body;


// Parse JSON string to object/array
if (typeof educationHistory === 'string') {
    educationHistory = JSON.parse(educationHistory);
}
if (typeof trainingHistory === 'string') {
    trainingHistory = JSON.parse(trainingHistory);
}
// Tambahan parsing untuk leaveInfo
if (typeof leaveInfo === 'string') {
    leaveInfo = JSON.parse(leaveInfo);
}

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Update data utama
        if (username !== undefined) employee.username = username;
        if (employee_name !== undefined) employee.employee_name = employee_name;
        if (nik !== undefined) employee.nik = nik;
        if (email !== undefined) employee.email = email;
        if (phone_nmb !== undefined) employee.phone_nmb = phone_nmb;
        if (gender !== undefined) employee.gender = gender;
        if (dob !== undefined) employee.dob = dob;
        if (pob !== undefined) employee.pob = pob;
        if (ktp_number !== undefined) employee.ktp_number = ktp_number;
        if (kk_number !== undefined) employee.kk_number = kk_number;
        if (npwp_number !== undefined) employee.npwp_number = npwp_number;
        if (ktp_address !== undefined) employee.ktp_address = ktp_address;
        if (joint_date !== undefined) employee.joint_date = joint_date;
        if (contract_end_date !== undefined) employee.contract_end_date = contract_end_date;
        if (bpjs_kesehatan_no !== undefined) employee.bpjs_kesehatan_no = bpjs_kesehatan_no;
        if (bpjs_clinic !== undefined) employee.bpjs_clinic = bpjs_clinic;
        if (bpjs_tk_no !== undefined) employee.bpjs_tk_no = bpjs_tk_no;
        if (bpjs_jp_no !== undefined) employee.bpjs_jp_no = bpjs_jp_no;
        if (department !== undefined) employee.department = department;

        // ======== UPDATE LEAVE INFO =========
        if (leaveInfo !== undefined) {
            // Initialize leaveInfo if it doesn't exist
            if (!employee.leaveInfo) {
                employee.leaveInfo = {
                    totalAnnualLeave: 12,
                    usedAnnualLeave: 0,
                    remainingAnnualLeave: 12
                };
            }
            
            // Update totalAnnualLeave
            if (leaveInfo.totalAnnualLeave !== undefined) {
                employee.leaveInfo.totalAnnualLeave = parseInt(leaveInfo.totalAnnualLeave) || 12;
            }
            
            // Update usedAnnualLeave
            if (leaveInfo.usedAnnualLeave !== undefined) {
                employee.leaveInfo.usedAnnualLeave = parseInt(leaveInfo.usedAnnualLeave) || 0;
            }
            
            // Auto calculate remaining leave untuk memastikan konsistensi
            employee.leaveInfo.remainingAnnualLeave = 
                employee.leaveInfo.totalAnnualLeave - employee.leaveInfo.usedAnnualLeave;
                
            // Pastikan remaining leave tidak negatif
            if (employee.leaveInfo.remainingAnnualLeave < 0) {
                employee.leaveInfo.remainingAnnualLeave = 0;
            }
        }

        // Handle file upload untuk foto
        if (req.file !== undefined) {
            if (employee.photo) {
                const oldPath = path.join(__dirname, '..', employee.photo);
                if (fs.existsSync(oldPath)) {
                    try {
                        fs.unlinkSync(oldPath);
                    } catch (err) {
                        console.log('Error deleting old photo:', err);
                    }
                }
            }
            employee.photo = `/uploads/profile-photos/${req.file.filename}`;
        }

        // ======== UPDATE EDUCATION HISTORY =========
        if (Array.isArray(educationHistory)) {
            const newEducationIds = educationHistory.filter(e => e._id).map(e => e._id.toString());

            // Delete yang tidak ada di body
            employee.educationHistory = employee.educationHistory.filter(e => newEducationIds.includes(e._id.toString()));

            // Update atau tambahkan
            educationHistory.forEach(edu => {
                if (edu._id) {
                    // Update
                    const index = employee.educationHistory.findIndex(e => e._id.toString() === edu._id);
                    if (index !== -1) {
                        employee.educationHistory[index] = { ...employee.educationHistory[index].toObject(), ...edu };
                    }
                } else {
                    // Tambah baru
                    employee.educationHistory.push(edu);
                }
            });
        }

        // ======== UPDATE TRAINING HISTORY =========
        if (Array.isArray(trainingHistory)) {
            const newTrainingIds = trainingHistory.filter(t => t._id).map(t => t._id.toString());

            // Delete yang tidak ada di body
            employee.trainingHistory = employee.trainingHistory.filter(t => newTrainingIds.includes(t._id.toString()));

            // Update atau tambahkan
            trainingHistory.forEach(tr => {
                if (tr._id) {
                    const index = employee.trainingHistory.findIndex(t => t._id.toString() === tr._id);
                    if (index !== -1) {
                        employee.trainingHistory[index] = { ...employee.trainingHistory[index].toObject(), ...tr };
                    }
                } else {
                    employee.trainingHistory.push(tr);
                }
            });
        }

        await employee.save();

        res.json({
            message: 'Employee profile updated successfully by HR',
            employee,
        });

    } catch (err) {
        console.log("[Endpoint] Error updating Employee profile by HR:", err);

        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                message: 'Validation Error',
                errors: errors
            });
        }

        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(400).json({
                message: `${field} already exists`
            });
        }

        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.editProfileHR = async (req, res) => {
    try {
        const hrId = req.hr._id;
        const { username, fullname, email, phone_nmb, gender, address } = req.body;

        // Cek apakah HR dengan ID tersebut ada
        const hr = await HR.findById(hrId);
        if (!hr) {
            return res.status(404).json({ message: 'HR not found' });
        }

        // Update data HR
        if (username) hr.username = username;
        if (fullname) hr.fullname = fullname;
        if (email) hr.email = email;
        if (phone_nmb) hr.phone_nmb = phone_nmb;
        if (gender) hr.gender = gender;
        if (address) hr.address = address;

        if (req.file) {
            if (hr.photo) {
                const oldPath = path.join(__dirname, '..', 'utils', hr.photo.replace(/^\/+/,'')); // path relatif
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            hr.photo = `/uploads/profile-photos/${req.file.filename}`;
        }

        await hr.save();
        res.json({ message: 'HR profile updated successfully', hr });
    } catch (err) {
        console.log("[Endpoint] Error updating HR profile:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.leaveApproval = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be either "approved" or "rejected".' });
        }

        const leaveRequest = await LeaveRequest.findById(req.params.id);
        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (leaveRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Leave request has already been processed.' });
        }

        const previousStatus = leaveRequest.status;
        leaveRequest.status = status;
        leaveRequest.approvedBy = req.hr._id;
        await leaveRequest.save();

        // Update leave balance only if status changes from pending to approved
        if (previousStatus === 'pending' && status === 'approved' && ['sick', 'annual', 'personal', 'maternity', 'other'].includes(leaveRequest.type)) {
            const employee = await Employee.findById(leaveRequest.employeeId);
            if (!employee) {
                return res.status(404).json({ message: 'Employee not found' });
            }

            if (!employee.leaveInfo) {
                employee.leaveInfo = {
                    totalAnnualLeave: 12,
                    usedAnnualLeave: 0,
                    remainingAnnualLeave: 12
                };
            }

            const totalDays = leaveRequest.totalDays || Math.ceil((new Date(leaveRequest.endDate) - new Date(leaveRequest.startDate)) / (1000 * 60 * 60 * 24)) + 1;

            employee.leaveInfo.usedAnnualLeave += totalDays;
            employee.leaveInfo.remainingAnnualLeave = employee.leaveInfo.totalAnnualLeave - employee.leaveInfo.usedAnnualLeave;

            if (employee.leaveInfo.remainingAnnualLeave < 0) {
                employee.leaveInfo.remainingAnnualLeave = 0;
            }

            await employee.save();

            console.log(`Leave approved for ${employee.username}:`);
            console.log(`- Total days: ${totalDays}`);
            console.log(`- Used leave: ${employee.leaveInfo.usedAnnualLeave}`);
            console.log(`- Remaining leave: ${employee.leaveInfo.remainingAnnualLeave}`);
        }

        res.json({
            message: `Leave request ${status} successfully`,
            leaveRequest
        });
    } catch (error) {
        console.error("Leave approval error:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// HR melihat semua pengajuan cuti
exports.viewLeaveRequest = async (req, res) => {
    try {
        const leaveRequests = await LeaveRequest.find().populate('employeeId', 'username department email'); // Ambil data employee
        res.json({ leaveRequests });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

// HR melihat hanya yang statusnya "pending"
exports.viewPendingLeaveRequest = async (req, res) => {
    try {
        const pendingRequests = await LeaveRequest.find({ status: 'pending' }).populate('employeeId', 'username department email');
        res.json({ pendingRequests });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

exports.uploadSalarySlip = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Simpan path file slip gaji ke database
        employee.salarySlip = `/uploads/salary-slips/${req.file.filename}`;
        await employee.save();

        res.json({ message: 'Salary slip uploaded successfully', salarySlip: employee.salarySlip });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

exports.getSalarySlips = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Cek apakah ada slip gaji
        if (!employee.salarySlips || employee.salarySlips.length === 0) {
            return res.status(404).json({ message: 'No salary slips available' });
        }

        // Buat URL lengkap untuk setiap slip gaji
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const salarySlips = employee.salarySlips.map(slip => ({
            path: encodeURI(`${baseUrl}${slip.path}`),
            date: slip.date
        }));

        res.json({ 
            employee: employee.employee_name,
            salarySlips 
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Internal Server Error', 
            error: error.message 
        });
    }
};

// HR melihat jumlah total karyawan
exports.countEmployees = async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        res.json({ totalEmployees });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

// HR counts pending leave requests
exports.countPendingLeaveRequests = async (req, res) => {
    try {
        const totalPendingRequests = await LeaveRequest.countDocuments({ status: 'pending' });
        res.json({ totalPendingRequests });
    } catch (error) {
        console.error("[Count Pending Requests] Error:", error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const hrId = req.hr._id; // ✅ perbaikan di sini
  
    try {
      const hr = await HR.findById(hrId);
      if (!hr) {
        console.log("HR not found with ID:", hrId);
        return res.status(404).json({ message: 'HR tidak ditemukan' });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, hr.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Password lama tidak sesuai' });
      }
  
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      hr.password = hashedNewPassword;
      await hr.save();
  
      res.json({ message: 'Password berhasil diubah' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  };
  
exports.getGenderSummary = async (req, res) => {
    try {
        const maleCount = await Employee.countDocuments({ gender: 'male' });
        const femaleCount = await Employee.countDocuments({ gender: 'female' });

        res.json({ male: maleCount, female: femaleCount });
    } catch (error) {
        console.error('Error fetching gender summary:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getDepartmentDistribution = async (req, res) => {
    try {
        const distribution = await Employee.aggregate([
            {
                $group: {
                    _id: "$department",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    employees: "$count"
                }
            }
        ]);

        res.json(distribution);
    } catch (error) {
        console.error('Error fetching department distribution:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.createAnnouncement = async (req, res) => {
  try {
    const { title, description, date, time, color } = req.body;
    
    // Validasi input
    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    // Pastikan HR pembuat ada
    const hr = await HR.findById(req.hr._id);
    if (!hr) {
      return res.status(404).json({ message: 'HR not found' });
    }

    const announcement = new Announcement({
      title,
      description: description || '', // Handle jika description kosong
      date: new Date(date), // Pastikan format Date
      time: time || '', // Handle jika time kosong
      color: color || '#3B82F6', // Default color
      createdBy: req.hr._id,
      createdByName: hr.username // Ambil username dari HR
    });

    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ 
      message: 'Failed to create announcement',
      error: error.message 
    });
  }
};

// Get announcements for a specific date
exports.getAnnouncementsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const announcements = await Announcement.find({
      date: new Date(date)
    }).sort({ time: 1 }).populate('createdBy', 'username'); // Remove createdBy filter and populate creator info

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      .populate('createdBy', 'username'); // Remove createdBy filter and populate creator info

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("[Delete Announcement] HR ID from token:", req.hr?._id);
    console.log("[Delete Announcement] HR ID type:", typeof req.hr?._id);

    // First find the announcement to check ownership
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    console.log("[Delete Announcement] Announcement createdBy:", announcement.createdBy);
    console.log("[Delete Announcement] Announcement createdBy type:", typeof announcement.createdBy);

    // Convert both IDs to string for safe comparison
    const hrIdString = req.hr._id.toString();
    const createdByIdString = announcement.createdBy.toString();

    console.log("[Delete Announcement] Comparing IDs:", {
      hrId: hrIdString,
      createdById: createdByIdString
    });

    // Check if the current user is the creator
    if (hrIdString !== createdByIdString) {
      return res.status(403).json({ message: 'Only the creator can delete this announcement' });
    }

    // If authorized, delete the announcement
    await announcement.deleteOne(); // Changed from remove() to deleteOne()

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error("[Delete Announcement] Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.uploadSalarySlipZip = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No ZIP file uploaded' });
        }

        const zipPath = req.file.path;
        const extractDir = path.join(__dirname, '../uploads/salary-slips/tmp');

        if (!fs.existsSync(extractDir)) {
            fs.mkdirSync(extractDir, { recursive: true });
        }

        // Ekstrak file ZIP ke folder sementara
        await fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: extractDir }))
            .promise();

        const files = fs.readdirSync(extractDir);
        const employees = await Employee.find();

        let matched = 0;
        let unmatchedFiles = [];
        let failedFiles = [];

        // Fungsi normalisasi yang lebih robust
        const normalize = (str) => {
            return str
                .toLowerCase()
                .replace(/\s/g, '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Hapus diakritik
                .replace(/[^a-z0-9]/g, ''); // Hapus karakter khusus
        };

        for (const file of files) {
            const filePath = path.join(extractDir, file);
            let finalPath, finalFilename;

            try {
                // Ambil nama dari file (tanpa prefix dan ekstensi)
                const fileNameNormalized = normalize(
                    file.replace(/^salary_/i, '').replace(/\.pdf$/i, '')
                );

                // Cari employee yang cocok
                const matchedEmployee = employees.find(emp => 
                    normalize(emp.employee_name) === fileNameNormalized
                );

                if (matchedEmployee) {
                    // Format tanggal untuk nama file
                    const now = new Date();
                    const pad = n => n.toString().padStart(2, '0');
                    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}`;
                    finalFilename = `${formattedDate}_${file}`;
                    finalPath = path.join(__dirname, '../utils/uploads/salary-slips', finalFilename);

                    // Pindahkan file ke folder permanen
                    fs.renameSync(filePath, finalPath);

                    // Pastikan salarySlips adalah array
                    if (!matchedEmployee.salarySlips) {
                        matchedEmployee.salarySlips = [];
                    }

                    // Tambahkan slip baru ke array
                    matchedEmployee.salarySlips.push({
                        path: `/uploads/salary-slips/${finalFilename}`,
                        date: now
                    });

                    // Urutkan berdasarkan tanggal (terbaru pertama)
                    matchedEmployee.salarySlips.sort((a, b) => b.date - a.date);

                    // Hapus slip terlama jika lebih dari 3
                    if (matchedEmployee.salarySlips.length > 3) {
                        const slipsToRemove = matchedEmployee.salarySlips.slice(3);
                        matchedEmployee.salarySlips = matchedEmployee.salarySlips.slice(0, 3);
                        
                        // Hapus file fisik slip terlama
                        slipsToRemove.forEach(slip => {
                            const fileToDelete = path.join(__dirname, '../utils', slip.path);
                            if (fs.existsSync(fileToDelete)) {
                                fs.unlinkSync(fileToDelete);
                            }
                        });
                    }

                    // Simpan perubahan
                    await matchedEmployee.save();
                    matched++;
                } else {
                    unmatchedFiles.push(file);
                    fs.unlinkSync(filePath); // Hapus file tak dikenali
                }
            } catch (error) {
                // Jika gagal, kembalikan file ke folder tmp
                if (finalPath && fs.existsSync(finalPath)) {
                    fs.renameSync(finalPath, filePath);
                }
                failedFiles.push({
                    file: file,
                    error: error.message
                });
                console.error(`Error processing file ${file}:`, error);
            }
        }

        // Bersihkan file ZIP dan folder sementara
        fs.unlinkSync(zipPath);
        fs.rmdirSync(extractDir, { recursive: true });

        res.json({
            message: 'ZIP processed',
            matched,
            unmatchedFiles,
            failedFiles
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};
exports.uploadExcelEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No Excel file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    fs.unlinkSync(req.file.path); // hapus file setelah dibaca

    const employees = await Promise.all(
      data.map(async (emp) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(emp.Password || 'DefaultPass123', salt);

        return {
          username: emp['username_final'],
          nik: emp['NIK'],
          employee_name: emp['Employee Name'],
          joint_date: formatDate(emp['Joint Date']),
          contract_end_date: formatDate(emp['Contract End date']),
          dob: formatDate(emp['Date of Birth']),
          pob: emp['Place of Birth'],
          ktp_number: emp['KTP Number'],
          kk_number: emp['KK No'],
          npwp_number: emp['NPWP Number'],
          gender: emp['Gender']?.toLowerCase() === 'l' ? 'male' : 'female',
          bpjs_kesehatan_no: emp['BPJS Kesehatan No'],
          bpjs_clinic: emp['BPJS Clinic'],
          bpjs_tk_no: emp['BPJS TK No'],
          bpjs_jp_no: emp['BPJS JP No'],
          phone_nmb: emp['No HP'],
          email: emp['Email'],
          ktp_address: emp['KTP Address'],
          photo: '',
          department: emp['Department'],
          educationHistory: [
            {
              last_education: emp['Last Education'],
              institution: emp['School / University'],
              majority: emp['Majority'],
              year_of_graduation: emp['Year of Graduation'],
            },
          ],
          trainingHistory: [],
          attendanceRecords: [],
          leaveInfo: [],
          leaveRecords: [],
          salarySlip: '',
          password: hashedPassword,
        };
      })
    );

    await Employee.insertMany(employees);

    res.status(201).json({
      message: 'Successfully uploaded and registered employees',
      count: employees.length,
    });
  } catch (err) {
    console.error('Upload Excel Error:', err);
    res.status(500).json({ message: 'Failed to process Excel file', error: err.message });
  }
};

function formatDate(excelDate) {
  if (!excelDate) return '';
  if (typeof excelDate === 'string') return excelDate.split('T')[0];
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

exports.getEmployeeAttendanceHistory = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findById(employeeId).populate('attendanceRecords');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    // Return attendance records sorted by checkIn descending
    const sortedRecords = employee.attendanceRecords.sort((a, b) => {
      const dateA = new Date(a.checkIn);
      const dateB = new Date(b.checkIn);
      return dateB - dateA;
    });
    res.json(sortedRecords);
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
