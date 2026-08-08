import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getAdminMetrics
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('shippingAddress.line1').notEmpty().withMessage('Address line 1 is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.province').notEmpty().withMessage('Province is required'),
    body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
    validate
  ],
  createOrder
);

router.get('/', getMyOrders);
router.get('/admin/all', admin, getAllOrdersAdmin);
router.get('/admin/metrics', admin, getAdminMetrics);
router.get('/:id', getOrderById);
router.put('/admin/:id/status', admin, updateOrderStatusAdmin);

export default router;
