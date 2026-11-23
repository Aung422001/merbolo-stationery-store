import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug price compareAtPrice images stock isActive category'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const addItemToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += Number(quantity);
      cart.items[itemIndex].priceAtAdd = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        priceAtAdd: product.price
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price compareAtPrice images stock isActive category'
    });

    res.json({ success: true, data: updatedCart });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    if (Number(quantity) <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = Number(quantity);
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price compareAtPrice images stock isActive category'
    });

    res.json({ success: true, data: updatedCart });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price compareAtPrice images stock isActive category'
    });

    res.json({ success: true, data: updatedCart });
  } catch (error) {
    next(error);
  }
};

export const clearUserCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    } else {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};
