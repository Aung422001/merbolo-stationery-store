import Stripe from 'stripe';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe payment configuration is incomplete');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export const createPaymentIntent = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart?.items?.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    if (cart.items.some(item => !item.product?.isActive || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > item.product.stock)) {
      return res.status(400).json({ success: false, message: 'Cart contains unavailable items or invalid quantities' });
    }
    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal + (subtotal > 1000 ? 0 : 50);
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'thb',
      metadata: { userId: String(req.user._id) }
    });
    return res.json({ success: true, data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total
    } });
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (req, res) => {
  let event;
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ success: false, message: 'Stripe webhook is not configured' });
    }
    event = getStripe().webhooks.constructEvent(
      req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid Stripe webhook signature' });
  }
  try {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      await Order.findOneAndUpdate(
        { paymentIntentId: intent.id, paymentStatus: 'pending', total: intent.amount_received / 100 },
        { paymentStatus: 'paid', orderStatus: 'processing' }
      );
    }
    return res.json({ received: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};
