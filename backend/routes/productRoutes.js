import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';
import authenticate from '../middleware/authMiddleware.js';
import {
    productValidation,
    mongoIdValidation,
} from '../middleware/validators.js';

const router = express.Router();

router.post('/', authenticate, productValidation, createProduct);
router.get('/', getAllProducts);
router.get('/:id', mongoIdValidation, getProductById);
router.put('/:id', authenticate, mongoIdValidation, productValidation, updateProduct);
router.delete('/:id', authenticate, mongoIdValidation, deleteProduct);

export default router;