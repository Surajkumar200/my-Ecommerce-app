import express from 'express';
import {
    register,
    login,
    refreshToken,
    logout,
    getMe,
} from '../controllers/authController.js';
import authenticate from '../middleware/authMiddleware.js';
import {
    registerValidation,
    loginValidation,
} from '../middleware/validators.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;