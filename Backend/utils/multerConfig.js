const path = require('path');
const multer = require('multer');
const fs = require('fs');

const getStorage = (subfolder) => multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, `uploads/${subfolder}`);
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

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG and PNG are allowed.'));
    }
};

module.exports = {
    uploadSalarySlip: multer({ storage: getStorage('salary-slips'), fileFilter }),
    uploadProfilePhoto: multer({ storage: getStorage('profile-photos'), fileFilter })
};
