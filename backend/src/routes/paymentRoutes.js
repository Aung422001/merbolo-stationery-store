import express from 'express';
import { createPaymentIntent, handleStripeWebhook } from '../controllers/paymentController.js';
import { confirmDemoPayment } from '../controllers/demoPaymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/demo/confirm', protect, confirmDemoPayment);
router.post('/create-intent', protect, createPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
