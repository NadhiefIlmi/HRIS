const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
    let token = req.header('Authorization');
    if(!token) return res.status(401).json({ message: 'Access Denied' });

    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if(verified.role != 'admin'){
            return res.status(403).json({ message: 'Forbidden: Admin Access Required' });
        }
        req.admin = verified;
        next();
    } catch (err){
        res.status(400).json({ message: 'Invalid Token' });   
    }
};

module.exports = authenticateAdmin;