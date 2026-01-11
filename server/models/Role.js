const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null }, // Null means System Role (Global)
    isSystemRole: { type: Boolean, default: false }
});

// Roles detailed:
// If tenantId is NULL: It's a "System Role" provided by the platform (e.g., 'Super Admin', 'Platform Manager') or a template.
// If tenantId is SET: It's a custom role created by that specific Tenant.

module.exports = mongoose.model('Role', roleSchema);
