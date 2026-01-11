const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In real world, hash this!
    name: String,

    // Multi-tenancy:
    // For now, assuming a user belongs to ONE tenant primarily for simplicity,
    // OR is a Super Admin.
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],

    isSuperAdmin: { type: Boolean, default: false }, // If true, bypasses tenant checks (Platform Owner)

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
