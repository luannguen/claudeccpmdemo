const tenantMiddleware = (req, res, next) => {
    // 1. If user is Super Admin, they *can* bypass tenant check if they explicitly want to manage the platform
    // But usually even they operate within a context.

    // 2. Identify Tenant Context
    // Priority: Header > User's Assigned Tenant > Error

    let tenantId = req.headers['x-tenant-id'];

    if (!tenantId && req.user && req.user.tenantId) {
        tenantId = req.user.tenantId.toString();
    }

    // 3. Enforce Isolation
    if (!tenantId && !req.user.isSuperAdmin) {
        return res.status(400).json({ message: 'Tenant Context Required' });
    }

    // 4. Verification (Optional but recommended: Check if tenant exists/active)

    // 5. Attach to Request
    req.tenantId = tenantId;

    // Auto-inject into query filter for strictly isolated endpoints
    req.tenantFilter = req.user.isSuperAdmin && !tenantId
        ? {} // SuperAdmin viewing all
        : { tenantId }; // Strict isolation

    next();
};

module.exports = tenantMiddleware;
