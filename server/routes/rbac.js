const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const { auth } = require('../middleware/auth');
const { requireTenant } = require('../middleware/tenant');

// Middleware: Ensure user is authenticated for all RBAC routes
// router.use(auth); // Assuming auth middleware is applied globally or we add it here

// GET /api/rbac/permissions
// List all available permissions (System + Tenant specific if any)
router.get('/permissions', async (req, res) => {
    try {
        const permissions = await Permission.find({});
        res.json(permissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/rbac/permissions
// Create a new dynamic permission
router.post('/permissions', async (req, res) => {
    try {
        const { resource, action, description } = req.body;
        const tenantId = req.tenantId;

        if (!resource || !action) {
            return res.status(400).json({ message: 'Resource and Action are required' });
        }

        const name = `${resource}.${action}`;
        const existing = await Permission.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: 'Permission already exists' });
        }

        const newPermission = new Permission({
            resource,
            action,
            name,
            description,
            scope: req.user?.isSuperAdmin ? 'system' : 'tenant'
        });

        await newPermission.save();
        res.status(201).json(newPermission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/rbac/roles
// List roles visible to current tenant
router.get('/roles', async (req, res) => {
    try {
        const tenantId = req.tenantId; // From middleware
        const isSuperAdmin = req.user?.isSuperAdmin;

        let query = {};
        if (isSuperAdmin && !tenantId) {
            query = {}; // Super admin sees all
        } else if (tenantId) {
            query = {
                $or: [
                    { tenantId: tenantId },
                    { tenantId: null } // System roles are visible
                ]
            };
        } else {
            // If no tenant context and not super admin, return public/system roles or error?
            // For now, return system roles
            query = { tenantId: null };
        }

        const roles = await Role.find(query).populate('permissions');
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/rbac/roles
// Create a new Role
router.post('/roles', async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        const tenantId = req.tenantId;

        if (!tenantId) {
            return res.status(400).json({ message: 'Tenant context required to create custom roles.' });
        }

        // Check if role name exists in this tenant
        const existing = await Role.findOne({ name, tenantId });
        if (existing) {
            return res.status(400).json({ message: 'Role with this name already exists in tenant.' });
        }

        const newRole = new Role({
            name,
            description,
            permissions, // Array of Permission ObjectIds
            tenantId,
            isSystemRole: false
        });

        await newRole.save();
        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/rbac/roles/:id
// Update a Role
router.put('/roles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;
        const tenantId = req.tenantId;

        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Security: Prevent modifying System Roles if not Super Admin (logic can be stricter)
        if (!role.tenantId) {
            return res.status(403).json({ message: 'Cannot modify System Roles.' });
        }

        // Security: Ensure role belongs to current tenant
        if (role.tenantId.toString() !== tenantId) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        role.name = name || role.name;
        role.description = description || role.description;
        if (permissions) role.permissions = permissions;

        await role.save();
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/rbac/roles/:id
router.delete('/roles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.tenantId;

        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        if (!role.tenantId) {
            return res.status(403).json({ message: 'Cannot delete System Roles.' });
        }

        if (role.tenantId.toString() !== tenantId) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        await role.deleteOne();
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
