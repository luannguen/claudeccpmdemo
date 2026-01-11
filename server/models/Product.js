const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    description: String,
    image: String,
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true } // Data Isolation
});

module.exports = mongoose.model('Product', productSchema);
