const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    workHours: { type: Number, default: 0 } // dalam jam
}, { 
    toJSON: { 
        transform: (doc, ret) => {
            ret.checkIn = ret.checkIn ? new Date(ret.checkIn).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : null;
            ret.checkOut = ret.checkOut ? new Date(ret.checkOut).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : null;

            // Konversi workHours ke jam dan menit
            const totalMinutes = Math.round(ret.workHours * 60);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            
            ret.workHours = `${hours} hours ${minutes} minutes`;
            return ret;
        }
    }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);