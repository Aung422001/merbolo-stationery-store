import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, items: directItems, paymentIntentId } = req.body;

    let itemsToProcess = [];

    if (directItems && directItems.length > 0) {
      itemsToProcess = directItems;
    } else {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }
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

      const itemPrice = product.price;
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity
      });

      // Deduct stock
      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }

    const shippingFee = subtotal > 1000 ? 0 : 50; // Free shipping over 1000 THB
    const total = subtotal + shippingFee;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingFee,
      total,
      paymentIntentId: paymentIntentId || '',
      paymentStatus: paymentIntentId ? 'paid' : 'pending'
    });

    // Clear user cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
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
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user is owner or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
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

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

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
      { $match: { paymentStatus: 'paid' } },
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
