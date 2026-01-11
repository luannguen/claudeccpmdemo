const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

// POST /api/saas/register
// Public endpoint for new tenant registration
router.post('/register', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { email, password, name, shopName, shopDomain, plan } = req.body;

        // 1. Validation
        if (!email || !password || !shopName) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Email already exists' });
        }

        if (shopDomain) {
            const existingDomain = await Tenant.findOne({ domain: shopDomain }).session(session);
            if (existingDomain) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Domain already taken' });
            }
        }

        // 2. Create Tenant
        const newTenant = new Tenant({
            name: shopName,
            domain: shopDomain || `${shopName.toLowerCase().replace(/\s+/g, '-')}.saas.com`, // Auto-generate if missing
            plan: plan || 'basic',
            status: 'active'
        });
        await newTenant.save({ session });

        // 3. Create "Tenant Owner" Role for this Tenant
        // First, fetch system permissions to assign to Owner
        const allPermissions = await Permission.find({}).session(session);
        const tenantPermissions = allPermissions.filter(p => p.scope === 'tenant').map(p => p._id);

        const ownerRole = new Role({
            name: 'Owner',
            description: 'Tenant Owner - Full Access',
            tenantId: newTenant._id,
            permissions: tenantPermissions,
            isSystemRole: false
        });
        await ownerRole.save({ session });

        // 4. Create User (Owner)
        const newUser = new User({
            email,
            password, // TODO: Hash this in real app!
            name,
            tenantId: newTenant._id,
            roles: [ownerRole._id],
            isSuperAdmin: false
        });
        await newUser.save({ session });

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                tenant: newTenant,
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    name: newUser.name
                }
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    } finally {
        session.endSession();
    }
});

// POST /api/saas/subscribe
// Mock endpoint to update subscription plan
router.post('/subscribe', async (req, res) => {
    try {
        const { tenantId, plan } = req.body;

        if (!['basic', 'pro', 'enterprise'].includes(plan)) {
            return res.status(400).json({ message: 'Invalid plan' });
        }

        const tenant = await Tenant.findByIdAndUpdate(
            tenantId,
            { plan },
            { new: true }
        );

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        res.json({
            success: true,
            message: `Subscribed to ${plan} plan`,
            data: tenant
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/saas/tenants/:id
// Get tenant details
router.get('/tenants/:id', async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.json({ success: true, data: tenant });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
