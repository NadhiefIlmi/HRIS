const mongoose = require('mongoose');

const HRSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    email: String,
    fullname: String,
    phone_nmb: String,
    address: String
});

module.exports = mongoose.model('HR', HRSchema);