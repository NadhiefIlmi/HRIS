const jwt = require('jsonwebtoken');

const authenticateEmployee = (req, res, next) => {
    let token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Pastikan role adalah Employee
        if (verified.role !== 'employee') {
            return res.status(403).json({ message: 'Forbidden: Employee Access Required' });
        }

        req.employee = { _id: String(verified._id), role: verified.role };
        console.log("Authenticated Employee ID:", req.employee._id);
        
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = authenticateEmployee;