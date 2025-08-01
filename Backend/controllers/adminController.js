const Admin = require('../models/Admin');
const HR = require('../models/HR');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { blacklistedTokens } = require('../middleware/checkBlacklistedToken');

// Admin Login Method
exports.loginAdmin = async (req, res) => {
    const {username, password} = req.body;
    const admin = await Admin.findOne({username});
    if (!admin) {
        return res.status(404).json({message: 'Admin not found'});
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({_id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {expiresIn: '1h'});
    res.json({token});
}

// Admin Register Method
exports.registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(409).json({ message: 'Username already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newAdmin = new Admin({ username, email, password: hashedPassword });
        await newAdmin.save();
        res.json({ message: 'Admin registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering Admin' });
    }
};

// Admin Logout Method
exports.logoutAdmin = (req, res) => {
    const token = req.header('Authorization');
    blacklistedTokens.add(token);
    res.json({ message: 'Logged out successfully' });
};

// Get All Admin Method
exports.getAdmin = async (req, res) => {
    try{
        const admin = await Admin.find({});
        res.json(admin);
    } catch(err){
         res.status(500).json({ message: 'Internal Server Error', error });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const {id} = req.params;
        const admin = await Admin.findById(id);
        if(!admin){
            return res.status(404).json({ message: 'Admin not found' });
        }
        const deletedUsername = admin.username;
        await Admin.deleteOne({_id: id});
        res.json({message: `Admin with username ${deletedUsername} deleted successfully`});
        } catch (err) {
            console.error("[Delete Admin] Error:", err);
            res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Register HR from Admin 
exports.registerHR = async (req, res) => {
    const { username, email, password } = req.body;
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
        const newHR = new HR({ username, email, password: hashedPassword });
        await newHR.save();
        res.json({ message: 'HR registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering HR' });
    }
};

// Get All HR Method
exports.getAllHR = async (req, res) => {
    const hr = await HR.find({}, { password: 0 });
    res.json(hr);
};

// Delete Specific HR Method
exports.deleteHR = async (req, res) => {
    try {
        const { id } = req.params;
        const hr = await HR.findById(id);
        if (!hr) {
            return res.status(404).json({ message: 'HR not found' });
        }
        const deletedUsername = hr.username;
        await HR.deleteOne({ _id: id });

        res.json({ message: `HR with username ${deletedUsername} deleted successfully` });
    } catch (err) {
        console.error("[Delete HR] Error:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};