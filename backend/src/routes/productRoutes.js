import express from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

router.post(
  '/',
  protect,
  admin,
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
    validate
  ],
  createProduct
);

router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
