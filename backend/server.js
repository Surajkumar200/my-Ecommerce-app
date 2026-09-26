import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();

// Database Connection
await connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));