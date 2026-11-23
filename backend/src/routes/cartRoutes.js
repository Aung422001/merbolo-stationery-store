import express from 'express';
import { body } from 'express-validator';
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearUserCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getCart);

router.post(
  '/items',
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    validate
  ],
  addItemToCart
);

router.put('/items/:productId', [body('quantity').isInt({ min: 0, max: 1000 }).withMessage('Quantity must be an integer between 0 and 1000'), validate], updateCartItemQuantity);
router.delete('/items/:productId', removeCartItem);
router.delete('/', clearUserCart);

export default router;
