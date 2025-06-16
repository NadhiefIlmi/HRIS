const mongoose = require('mongoose');

const HRSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    email: String,
    fullname: String,
    photo: { type: String, default: '' },
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    phone_nmb: String,
    address: String
});

module.exports = mongoose.model('HR', HRSchema);