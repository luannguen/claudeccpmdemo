const User = require('../models/User');

// Mock Auth Middleware
// In production, this would verify JWT from Authorization header
const authMiddleware = async (req, res, next) => {
    try {
        // For development/demo, we'll simulate auth via a header 'x-user-email'
        // or default to the Super Admin if not provided (for ease of testing)
        const email = req.headers['x-user-email'] || 'admin@platform.com'; // Default to SuperAdmin

        const user = await User.findOne({ email }).populate('roles');

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Auth Error: ' + error.message });
    }
};

module.exports = authMiddleware;
