const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
// Simple email-based login for demo purpose
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // In real app: verify password hash
        const user = await User.findOne({ email }).populate({
            path: 'roles',
            populate: { path: 'permissions' }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return user info directly (or a token in real app)
        // We will flatten permissions for the frontend
        const permissions = new Set();
        user.roles.forEach(role => {
            role.permissions.forEach(p => permissions.add(p.name));
        });

        // Simplified User Object for Frontend
        const userDTO = {
            id: user._id,
            email: user.email,
            name: user.name,
            tenantId: user.tenantId,
            isSuperAdmin: user.isSuperAdmin,
            roles: user.roles.map(r => r.name),
            permissions: Array.from(permissions)
        };

        res.json({ success: true, user: userDTO });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
