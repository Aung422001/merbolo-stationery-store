import Stripe from 'stripe';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mockKey');

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount } = req.body;

    let totalAmount = amount;

    if (!totalAmount) {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }

      const subtotal = cart.items.reduce((sum, item) => {
        return sum + (item.product ? item.product.price * item.quantity : 0);
      }, 0);

      const shippingFee = subtotal > 1000 ? 0 : 50;
      totalAmount = subtotal + shippingFee;
    }

    // Amount in Stripe for THB is in satang (1 THB = 100 satang)
    const amountInSatang = Math.round(totalAmount * 100);

    // If Stripe key is mock/placeholder in dev environment
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_51Mock')) {
      return res.json({
        success: true,
        data: {
          clientSecret: 'mock_client_secret_test_mode',
          amount: totalAmount
        }
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSatang,
      currency: 'thb',
      metadata: { userId: req.user._id.toString() }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_mock')) {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { paymentStatus: 'paid', orderStatus: 'processing' }
    );
  }

  res.json({ received: true });
};
