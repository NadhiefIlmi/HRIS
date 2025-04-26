const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  checkIn: { type: Date, default: null },
  checkOut: { type: Date, default: null },
  workHours: { type: Number, default: 0 }, // dalam jam
}, { 
  toJSON: { 
    transform: (doc, ret) => {
      // Pastikan untuk mengirim dalam format ISO 8601
      ret.checkIn = ret.checkIn ? ret.checkIn.toISOString() : null;
      ret.checkOut = ret.checkOut ? ret.checkOut.toISOString() : null;

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
