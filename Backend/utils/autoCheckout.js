const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Jalankan setiap hari jam 17:00 (5 sore)
cron.schedule('0 17 * * *', async () => {
    try {
        console.log('Running auto check-out at 5 PM...');

        // 1. Ambil tanggal hari ini (awal dan akhir hari)
        const now = new Date();
        const startOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0, 0, 0  // 00:00:00
        );
        const endOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23, 59, 59  // 23:59:59
        );

        // 2. Cari semua attendance yang:
        //    - checkIn hari ini
        //    - checkOut masih null
        const pendingAttendances = await Attendance.find({
            checkIn: { $gte: startOfDay, $lte: endOfDay },
            checkOut: null
        });

        // 3. Update checkOut otomatis ke jam 17:00
        for (const attendance of pendingAttendances) {
            const checkOutTime = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                17, 0, 0  // 17:00:00
            );

            attendance.checkOut = checkOutTime;
            attendance.workHours = ((checkOutTime - attendance.checkIn) / 3600000).toFixed(2);
            await attendance.save();
            console.log(`Auto check-out for attendance ${attendance._id}`);
        }

        console.log('Auto check-out completed.');
    } catch (error) {
        console.error('Error in auto check-out:', error);
    }
}, {
    timezone: "Asia/Jakarta"  // Sesuaikan dengan timezone Anda
});