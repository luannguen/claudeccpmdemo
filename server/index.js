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

// Schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    description: String,
    image: String,
});

const Product = mongoose.model('Product', productSchema);

// Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/products/seed', async (req, res) => {
    try {
        await Product.deleteMany({});
        const seedData = [
            { name: 'Smartphone X', price: 999, category: 'Electronics', description: 'Latest flagship phone', image: 'https://via.placeholder.com/300' },
            { name: 'Laptop Pro', price: 1499, category: 'Electronics', description: 'High performance laptop', image: 'https://via.placeholder.com/300' },
            { name: 'Running Shoes', price: 89, category: 'Clothing', description: 'Fast shoes', image: 'https://via.placeholder.com/300' },
            { name: 'Coffee Maker', price: 49, category: 'Home', description: 'Brews coffee', image: 'https://via.placeholder.com/300' },
        ];
        const products = await Product.insertMany(seedData);
        res.json({ message: 'Seeded successfully', count: products.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
