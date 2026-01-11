const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    domain: { type: String, unique: true }, // e.g. "store1.mysaas.com"
    plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', tenantSchema);
