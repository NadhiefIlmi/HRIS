const blacklistedTokens = new Set();
const checkBlacklistedToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (blacklistedTokens.has(token)) {
        return res.status(401).json({ message: 'Token has been revoked, please login again' });
    }
    next();
};

module.exports = {checkBlacklistedToken, blacklistedTokens};