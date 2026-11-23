import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Deliberately no card details or payment credentials. Demo-only state transition.
export const confirmDemoPayment = async (req, res, next) => {
  const { orderId, outcome } = req.body || {};
  if (!mongoose.isValidObjectId(orderId) || !['success', 'failure'].includes(outcome)) {
    return res.status(400).json({ success: false, message: 'Invalid demo request' });
  }
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: orderId, user: req.user._id, isDemo: true }).session(session);
      if (!order) { result = { code: 404, message: 'Demo order not found' }; return; }
      if (order.paymentStatus !== 'pending') {
        result = { code: 409, message: 'Demo order already finalized' }; return;
      }
      if (outcome === 'failure') {
        order.paymentStatus = 'failed';
        order.demoOutcome = 'failure';
        await order.save({ session });
        result = { code: 200, order };
        return;
      }
      for (const item of order.items) {
        const updated = await Product.updateOne(
          { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }, { session }
        );
        if (updated.modifiedCount !== 1) {
          result = { code: 409, message: 'Insufficient inventory for demo order' };
          throw new Error('INSUFFICIENT_STOCK');
        }
      }
      order.paymentStatus = 'paid';
      order.orderStatus = 'processing';
      order.demoOutcome = 'success';
      await order.save({ session });
      // Do not clear the cart here: its contents may have changed after order creation.
      result = { code: 200, order };
    });
    if (result?.message) return res.status(result.code).json({ success: false, message: result.message });
    return res.json({ success: true, data: result.order });
  } catch (error) {
    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(409).json({ success: false, message: 'Insufficient inventory for demo order' });
    }
    return next(error);
  } finally { await session.endSession(); }
};
