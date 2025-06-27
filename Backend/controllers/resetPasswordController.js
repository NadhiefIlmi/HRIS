const Employee = require('../models/Employee');
const HR = require('../models/HR');
const Admin = require('../models/Admin');
const ResetToken = require('../models/ResetToken');
const bcrypt = require('bcryptjs');
const { transporter, generateOTPEmail } = require('../utils/emailConfig');

/* ENDPOINT RESET PASSWORD */
exports.requestResetPassword = async (req, res) => {
    const { username, email } = req.body;

    try {
        let user = await Employee.findOne({ username, email });
        let role = 'employee';
        if (!user) {
            user = await HR.findOne({ username, email });
            role = 'hr';
        }
        if(!user){
            user = await Admin.findOne({ username, email });
            role = 'admin';
        }

        if (!user){
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }
            
        // Generate OTP 6 digit
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Berlaku 10 menit

        // Simpan OTP di database
        await ResetToken.findOneAndUpdate(
            { username },
            { otp, expiresAt, role },
            { upsert: true }
        );

        // Kirim email dengan OTP
        const mailOptions = {
            from: `"Chtr Manufacture" <no-reply@yourdomain.com>`,
            to: email,
            subject: 'Reset Password OTP',
            html: generateOTPEmail(otp)
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'OTP telah dikirim ke email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

exports.resetPassword = async (req, res) => {
    const { username, otp, newPassword } = req.body;

    try {
        // Cek apakah OTP valid
        const resetToken = await ResetToken.findOne({ username, otp });
        if (!resetToken) return res.status(400).json({ message: 'OTP tidak valid' });

        // Cek apakah OTP sudah kedaluwarsa
        if (resetToken.expiresAt < new Date()) {
            await ResetToken.deleteOne({ username });  // Hapus OTP yang expired
            return res.status(400).json({ message: 'OTP sudah kedaluwarsa' });
        }
        
        // Hash password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password berdasarkan role
        if (resetToken.role === 'employee') {
            await Employee.findOneAndUpdate({ username }, { password: hashedPassword });
        } else if (resetToken.role === 'hr') {
            await HR.findOneAndUpdate({ username }, { password: hashedPassword });
        } else if (resetToken.role === 'admin') {
            await Admin.findOneAndUpdate({ username }, { password: hashedPassword });
        } else {
            return res.status(400).json({ message: 'Role tidak valid' });
        }   

        // Hapus OTP setelah digunakan
        await ResetToken.deleteOne({ username });

        res.json({ message: 'Password berhasil diperbarui' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};
