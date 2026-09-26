import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate JWT Tokens
const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });
};

// Register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt,
        };

        return res.status(201).json({
            message: 'User registered successfully',
            user: userResponse,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Persist refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        // Set httpOnly cookie for refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error during login' });
    }
};

// Refresh Token
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({ message: 'Invalid or revoked refresh token' });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err || user._id.toString() !== decoded.id) {
                return res.status(403).json({ message: 'Invalid or expired refresh token' });
            }

            const newAccessToken = generateAccessToken(user._id);
            return res.status(200).json({ accessToken: newAccessToken });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error during token refresh' });
    }
};

// Logout
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            const user = await User.findOne({ refreshToken });
            if (user) {
                user.refreshToken = null;
                await user.save();
            }
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error during logout' });
    }
};

// Get Me
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -refreshToken');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Server error fetching user profile' });
    } 
};