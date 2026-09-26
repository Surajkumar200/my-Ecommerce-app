import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Helper to extract and structure field-level errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = {};
        errors.array().forEach((err) => {
            if (err.path && !formattedErrors[err.path]) {
                formattedErrors[err.path] = err.msg;
            }
        });
        return res.status(400).json({ errors: formattedErrors });
    }
    next();
};

// Auth Input Validations
export const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    validate,
];

export const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
];

// Product Input Validations
export const productValidation = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').optional().trim(),
    body('price')
        .isNumeric()
        .withMessage('Price must be a valid number')
        .custom((value) => value >= 0)
        .withMessage('Price cannot be negative'),
    body('stock')
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    validate,
];

export const mongoIdValidation = [
    param('id').custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('Invalid ID format');
        }
        return true;
    }),
    validate,
];