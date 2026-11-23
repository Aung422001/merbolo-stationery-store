import Stripe from 'stripe';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const stripe = () => {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock')) {
    throw new Error('Valid Stripe secret key is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!mongoose.isValidObjectId(orderId)) return res.status(400).json({ success: false, message: 'Invalid order' });
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order || order.paymentStatus !== 'pending' || order.isDemo !== false || order.paymentProvider !== 'stripe') return res.status(409).json({ success: false, message: 'Order is not eligible for Stripe payment' });
    if (order.paymentIntentId) {
      const existing = await stripe().paymentIntents.retrieve(order.paymentIntentId);
      if (existing.status === 'succeeded' || existing.status === 'canceled') {
        return res.status(409).json({ success: false, message: 'Payment already finalized' });
      }
      return res.json({ success: true, data: { clientSecret: existing.client_secret, paymentIntentId: existing.id, amount: order.total } });
    }
    const intent = await stripe().paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: 'thb',
      metadata: { orderId: String(order._id), userId: String(req.user._id) }
    }, { idempotencyKey: `merbolo-order-${order._id}` });
    await Order.updateOne({ _id: order._id, paymentIntentId: '' }, { $set: { paymentIntentId: intent.id } });
    return res.json({ success: true, data: { clientSecret: intent.client_secret, paymentIntentId: intent.id, amount: order.total } });
  } catch (error) { next(error); }
};

export const handleStripeWebhook = async (req, res) => {
  let event;
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).json({ success: false, message: 'Webhook not configured' });
    event = stripe().webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }
  if (event.type !== 'payment_intent.succeeded') return res.json({ received: true });
  const intent = event.data.object;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({ paymentIntentId: intent.id }).session(session);
      if (!order || order.paymentStatus === 'paid') return;
      if (order.isDemo !== false || order.paymentProvider !== 'stripe') throw new Error('Stripe webhook cannot fulfill a demo order');
      if (order.paymentStatus !== 'pending' || intent.currency !== 'thb' ||
          Math.round(order.total * 100) !== intent.amount_received ||
          String(order._id) !== intent.metadata?.orderId) {
        throw new Error('Payment does not match pending order');
      }
      for (const item of order.items) {
        const result = await Product.updateOne(
          { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }, { session }
        );
        if (result.modifiedCount !== 1) throw new Error('Insufficient stock; manual refund required');
      }
      await Order.updateOne({ _id: order._id, paymentStatus: 'pending' },
        { $set: { paymentStatus: 'paid', orderStatus: 'processing' } }, { session });
      await Cart.updateOne({ user: order.user }, { $set: { items: [] } }, { session });
    });
    return res.json({ received: true });
  } catch (error) {
    console.error('Payment fulfillment requires attention:', intent.id, error.message);
    return res.status(500).json({ success: false, message: 'Payment fulfillment pending review' });
  } finally { await session.endSession(); }
};
