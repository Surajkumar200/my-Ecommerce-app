import Product from '../models/Product.js';

// Create Product
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            user: req.user.id,
        });

        return res.status(201).json(product);
    } catch (error) {
        return res.status(500).json({ message: 'Server error creating product' });
    }
};

// Get All Products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('user', 'name email');
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: 'Server error fetching products' });
    }
};

// Get Single Product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('user', 'name email');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ message: 'Server error fetching product' });
    }
};

// Update Product
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const { name, description, price, stock } = req.body;

        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.stock = stock ?? product.stock;

        const updatedProduct = await product.save();
        return res.status(200).json(updatedProduct);
    } catch (error) {
        return res.status(500).json({ message: 'Server error updating product' });
    }
};

// Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error deleting product' });
    }
};