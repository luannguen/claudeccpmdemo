const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/ccpm_shop')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
const authMiddleware = require('./middleware/auth');
const tenantMiddleware = require('./middleware/tenant');

// Import Route handlers
const authRoutes = require('./routes/auth');
const rbacRoutes = require('./routes/rbac');
const userRoutes = require('./routes/users');

// Routes Registry
app.use('/api/auth', authRoutes);
// RBAC routes need auth and tenant context
app.use('/api/rbac', authMiddleware, tenantMiddleware, rbacRoutes);
app.use('/api/users', authMiddleware, tenantMiddleware, userRoutes);

// Models
const Tenant = require('./models/Tenant');
const Permission = require('./models/Permission');
const Role = require('./models/Role');
const User = require('./models/User');
const Product = require('./models/Product');

// Routes
app.get('/api/products', async (req, res) => {
    try {
        // SaaS: In real app, we filter by req.user.tenantId
        // For MVP demo, allow passing ?tenantId=... or header
        const tenantId = req.headers['x-tenant-id'] || req.query.tenantId;
        const query = tenantId ? { tenantId } : {};

        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// SaaS Seeding Endpoint (One-click setup for Demo)
app.post('/api/saas/seed', async (req, res) => {
    try {
        await mongoose.connection.db.dropDatabase(); // Dangerous! Only for Dev

        // 1. Create Tenants
        const tenantA = await Tenant.create({ name: 'TechStore A', domain: 'a.tech.com', plan: 'pro' });
        const tenantB = await Tenant.create({ name: 'FashionStore B', domain: 'b.fashion.com', plan: 'basic' });

        // 2. Create System Permissions
        const perms = await Permission.insertMany([
            { resource: 'product', action: 'create', name: 'product.create', scope: 'tenant' },
            { resource: 'product', action: 'read', name: 'product.read', scope: 'tenant' },
            { resource: 'user', action: 'manage', name: 'user.manage', scope: 'tenant' },
            { resource: 'tenant', action: 'manage', name: 'tenant.manage', scope: 'system' } // Super Admin only
        ]);

        // 3. Create Roles
        // System Admin Role
        const pTenantManage = perms.find(p => p.name === 'tenant.manage');
        const rSuperAdmin = await Role.create({
            name: 'Super Admin',
            isSystemRole: true,
            permissions: [pTenantManage._id]
        });

        // Tenant A Roles
        const pProductCreate = perms.find(p => p.name === 'product.create');
        const pProductRead = perms.find(p => p.name === 'product.read');

        const rManagerA = await Role.create({
            name: 'Store Manager',
            tenantId: tenantA._id,
            permissions: [pProductCreate._id, pProductRead._id]
        });

        // 4. Create Users
        await User.create([
            { email: 'admin@platform.com', password: '123', isSuperAdmin: true, roles: [rSuperAdmin._id] },
            { email: 'manager@a.com', password: '123', tenantId: tenantA._id, roles: [rManagerA._id] },
            { email: 'staff@b.com', password: '123', tenantId: tenantB._id }
        ]);

        // 5. Create Products (Isolated!)
        await Product.create([
            { name: 'iPhone 15', price: 999, category: 'Electronics', tenantId: tenantA._id, image: 'https://via.placeholder.com/150' },
            { name: 'Samsung S24', price: 899, category: 'Electronics', tenantId: tenantA._id, image: 'https://via.placeholder.com/150' },
            { name: 'Jean Jacket', price: 50, category: 'Clothing', tenantId: tenantB._id, image: 'https://via.placeholder.com/150' }
        ]);

        res.json({ message: 'SaaS Environment Seeded!', tenants: [tenantA.name, tenantB.name] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
