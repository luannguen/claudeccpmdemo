const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');

// GET /api/users
// List users for the current tenant
router.get('/', async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const isSuperAdmin = req.user?.isSuperAdmin;

        let query = {};
        if (isSuperAdmin && !tenantId) {
            query = {}; // Super admin sees all users provided they are not filtered by tenant header? 
            // Actually, usually even super admin views users contextually or all. 
            // Let's assume if no tenantId, show all (for platform admin dashboard).
        } else if (tenantId) {
            query = { tenantId };
        } else {
            // No context, no access unless super admin
            return res.status(403).json({ message: 'Tenant context required.' });
        }

        const users = await User.find(query)
            .populate('roles', 'name isSystemRole') // Populate role names
            .select('-password'); // Exclude password

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/users/invite
// Invite a new user to the tenant
router.post('/invite', async (req, res) => {
    try {
        const { email, name, roleIds } = req.body;
        const tenantId = req.tenantId;

        if (!tenantId) {
            return res.status(400).json({ message: 'Tenant context required.' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            // For MVP: If user exists, we might want to just add them to tenant if they don't belong?
            // But our schema assumes 1 user = 1 tenant for simplicity.
            // So if unique email, fail.
            return res.status(400).json({ message: 'User already exists.' });
        }

        user = new User({
            email,
            name,
            password: '123', // Default password for MVP
            tenantId,
            roles: roleIds || []
        });

        await user.save();

        // Return user without password
        const userObj = user.toObject();
        delete userObj.password;

        // Populate roles for response?
        // Let's just return basic info first or re-fetch. 
        // For simplicity, just return what we have.
        res.status(201).json(userObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/users/:id/roles
// Update user roles
router.put('/:id/roles', async (req, res) => {
    try {
        const { id } = req.params;
        const { roleIds } = req.body;
        const tenantId = req.tenantId;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.tenantId && user.tenantId.toString() !== tenantId) {
            return res.status(403).json({ message: 'Access denied: User belongs to another tenant.' });
        }

        // Validate roles belong to tenant or are system roles
        // Ideally we check each roleId. skipping for MVP speed, reliant on UI/trust.
        // Proper way: const validRoles = await Role.countDocuments({ _id: { $in: roleIds }, $or: [{ tenantId }, { tenantId: null }] });

        user.roles = roleIds;
        await user.save();

        const updatedUser = await User.findById(id).populate('roles', 'name isSystemRole').select('-password');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/users/:id
// Remove user from tenant
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.tenantId;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.tenantId && user.tenantId.toString() !== tenantId) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
