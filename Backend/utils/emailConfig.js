const nodemailer = require('nodemailer');

/* FUNGSI NOTIFIKASI KE EMAIL */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Gunakan email perusahaan
        pass: process.env.EMAIL_PASS   // Gunakan App Password Gmail
    }
});

// Fungsi untuk generate email HTML
const generateOTPEmail = (otp) => {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Reset Password Request</h2>
        <p style="color: #555;">Gunakan kode OTP di bawah ini untuk mereset password Anda:</p>
        <h3 style="color: #d9534f; text-align: center;">${otp}</h3>
        <p style="color: #555;">Kode OTP ini hanya berlaku selama 10 menit.</p>
    </div>
    `;
};

const sendLeaveNotification = async (hrEmail, employeeName, leaveDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: hrEmail,
        subject: 'New Leave Request Submitted',
        text: `Employee ${employeeName} has submitted a leave request: \n${leaveDetails}`
    };
    await transporter.sendMail(mailOptions);
};

module.exports = {transporter, generateOTPEmail, sendLeaveNotification};