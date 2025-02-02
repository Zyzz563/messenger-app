const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } else {
            res.status(401).json({ message: 'Не авторизован' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Не авторизован' });
    }
};

module.exports = protect;