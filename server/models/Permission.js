const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    resource: { type: String, required: true }, // e.g., 'product', 'user', 'settings'
    action: { type: String, required: true },   // e.g., 'create', 'read', 'update', 'delete', 'manage'
    name: { type: String, required: true },     // e.g., 'product.create' (auto-generated)
    description: String,
    scope: { type: String, enum: ['system', 'tenant'], default: 'tenant' } // 'system' for platform level, 'tenant' for shop level
});

// Compound unique index to prevent duplicates
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

module.exports = mongoose.model('Permission', permissionSchema);
