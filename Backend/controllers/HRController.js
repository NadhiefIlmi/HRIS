const unzipper = require('unzipper');
const HR = require('../models/HR');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { blacklistedTokens } = require('../middleware/checkBlacklistedToken');
const LeaveRequest = require('../models/LeaveRequest');
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
        console.error('Register HR error:', err);
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

        const hr = await HR.findById(hrId); // Jangan tampilkan password

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

// **HR Bisa Melihat Semua Karyawan**
exports.getAllHR = async (req, res) => {
    const hr = await HR.find({}, { password: 0 });
    res.json(hr);
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

        leaveRequest.status = status;
        leaveRequest.approvedBy = req.hr._id;
        await leaveRequest.save();

        // Kurangi sisa cuti jika disetujui
        if (status === 'approved' && leaveRequest.type === 'annual') {
            const employee = await Employee.findById(leaveRequest.employeeId);
            const totalDays = Math.ceil((new Date(leaveRequest.endDate) - new Date(leaveRequest.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            
            employee.leaveInfo.usedAnnualLeave += totalDays;
            employee.leaveInfo.remainingAnnualLeave -= totalDays;
            await employee.save();
        }

        res.json({ message: `Leave request ${status} successfully`, leaveRequest });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
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

exports.getSalarySlip =  async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        console.log(employee);
        if (!employee || !employee.salarySlip) {
            return res.status(404).json({ message: 'No salary slip available' });
        }

        // Pastikan URL bisa diakses dari browser
        res.json({ salarySlip: encodeURI(`${req.protocol}://${req.get('host')}${employee.salarySlip}`) });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
        console.log(error);
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

        // Fungsi normalisasi
        const normalize = str => str.toLowerCase().replace(/\s/g, '');

        for (const file of files) {
            const filePath = path.join(extractDir, file);

            // Ambil nama dari file (tanpa prefix dan ekstensi)
            const fileNameNormalized = normalize(
                file.replace(/^salary_/, '').replace(/\.pdf$/, '')
            );

            // Cari employee yang cocok
            const matchedEmployee = employees.find(emp =>
                normalize(emp.employee_name) === fileNameNormalized
            );

            if (matchedEmployee) {
                // Format tanggal untuk nama file
                const now = new Date();
                const pad = n => n.toString().padStart(2, '0');
                const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
                const finalFilename = `${formattedDate}_${file}`;
                const finalPath = path.join(__dirname, '../utils/uploads/salary-slips', finalFilename);

                // Pindahkan file dan update path di database
                fs.renameSync(filePath, finalPath);

                matchedEmployee.salarySlip = `/uploads/salary-slips/${finalFilename}`;
                await matchedEmployee.save();

                matched++;
            } else {
                unmatchedFiles.push(file);
                fs.unlinkSync(filePath); // Hapus file tak dikenali
            }
        }

        // Bersihkan file ZIP dan folder sementara
        fs.unlinkSync(zipPath);
        fs.rmdirSync(extractDir, { recursive: true });

        res.json({
            message: 'ZIP processed',
            matched,
            unmatchedFiles
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
          department: emp['Department'] || '',
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