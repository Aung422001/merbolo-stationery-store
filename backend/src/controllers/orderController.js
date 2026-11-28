import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const createOrder = async (req, res, next) => {
  const { shippingAddress, checkoutRequestId } = req.body;
  const hasRequestId = checkoutRequestId !== undefined;
  if (hasRequestId && (typeof checkoutRequestId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(checkoutRequestId))) {
    return res.status(400).json({ success: false, message: 'Invalid checkout request ID' });
  }
  const checkoutFilter = { user: req.user._id, checkoutRequestId };
  try {
    if (hasRequestId) {
      await Order.init();
      const existing = await Order.findOne(checkoutFilter);
      if (existing) return res.status(200).json({ success: true, data: existing });
    }

    let itemsToProcess = [];

    {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }
      if (cart.items.some((item) => !item.product)) return res.status(400).json({ success: false, message: 'Cart contains an unavailable product' });
      itemsToProcess = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity
      }));
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of itemsToProcess) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} is not available`
        });
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > product.stock) {
        return res.status(400).json({ success: false, message: 'Invalid quantity or insufficient stock' });
      }
      const itemPrice = product.price;
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity
      });

      // Inventory is reserved only after payment is verified by the server.
    }

    const shippingFee = subtotal > 1000 ? 0 : 50; // MMK demo shipping: 50 MMK, free over 1,000 MMK
    const total = subtotal + shippingFee;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingFee,
      total,
      ...(hasRequestId ? { checkoutRequestId } : {}),
      paymentIntentId: '',
      paymentStatus: 'pending',
      paymentProvider: 'demo',
      isDemo: true
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    if (hasRequestId && error.code === 11000) {
      try {
        const existing = await Order.findOne(checkoutFilter);
        if (existing) return res.status(200).json({ success: true, data: existing });
      } catch (lookupError) { return next(lookupError); }
    }
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    // Enforce ownership in the database query to avoid leaking whether
    // another customer's order ID exists (IDOR enumeration).
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };
    const order = await Order.findOne(filter).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusAdmin = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    if (paymentStatus !== undefined) return res.status(403).json({ success: false, message: 'Payment status is managed by verified payment events' });

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.isDemo && ['shipped', 'delivered'].includes(orderStatus)) return res.status(409).json({ success: false, message: 'Demo orders cannot enter real shipping fulfillment' });
    if (orderStatus && order.paymentStatus !== 'paid' && ['processing', 'shipped', 'delivered'].includes(orderStatus)) return res.status(409).json({ success: false, message: 'Cannot fulfill an unpaid order' });
    if (orderStatus) order.orderStatus = orderStatus;

    const updatedOrder = await order.save();
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

export const getAdminMetrics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid', isDemo: false } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5 } });

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        lowStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};
