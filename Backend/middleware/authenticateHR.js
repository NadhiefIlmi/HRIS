const jwt = require('jsonwebtoken');

const authenticateHR = (req, res, next) => {
    let token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Verified token payload:", verified); // 👉 cek payload token

        // Pastikan role adalah HR
        if (verified.role !== 'hr') {
            return res.status(403).json({ message: 'Forbidden: HR Access Required' });
        }

        req.hr = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = authenticateHR;