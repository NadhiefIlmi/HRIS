const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Konfigurasi untuk file salary slip (hanya PDF)
const getStorageForSalarySlip = () => multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads/salary-slips');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        cb(null, `${formattedDate}_${file.originalname.replace(/\.[^/.]+$/, '.pdf')}`);
    }
});

// Konfigurasi untuk file profil foto (gambar: JPG atau PNG)
const getStorageForProfilePhoto = () => multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads/profile-photos');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        cb(null, `${formattedDate}_${file.originalname}`);
    }
});

// Filter hanya untuk file PDF (salary slip)
const fileFilterForSalarySlip = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF files are allowed.'));
    }
};

// Filter hanya untuk file ZIP
const fileFilterForZip = (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only ZIP files are allowed.'));
    }
};

// Storage untuk file ZIP sementara
const getStorageForZip = () => multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads/zips');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

// Filter untuk file gambar (profil foto)
const fileFilterForProfilePhoto = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG and PNG are allowed.'));
    }
};

module.exports = {
    // Middleware untuk upload salary slip (PDF)
    uploadSalarySlip: multer({ storage: getStorageForSalarySlip(), fileFilter: fileFilterForSalarySlip }),

    // Middleware untuk upload profil foto (gambar)
    uploadProfilePhoto: multer({ storage: getStorageForProfilePhoto(), fileFilter: fileFilterForProfilePhoto }),

    uploadSalarySlipZip: multer({ storage: getStorageForSalarySlip(), fileFilter: fileFilterForZip })
};
