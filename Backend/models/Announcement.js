const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  time: String,
  color: { type: String, default: '#3B82F6' },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HR',
    required: true 
  },
  createdByName: { type: String, required: true }
}, { timestamps: true });

// Solusi 1: Cek apakah model sudah ada sebelum membuatnya
const Announcement = mongoose.models.Announcement || 
                   mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;