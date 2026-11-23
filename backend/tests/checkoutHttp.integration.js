import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Cart from '../src/models/Cart.js';
import Order from '../src/models/Order.js';

test('HTTP checkout against real Express and isolated replica-set MongoDB', { timeout: 180000 }, async t => {
  process.env.JWT_SECRET = 'test-only-isolated-checkout-secret';
  process.env.NODE_ENV = 'test';
  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  let server;
  try {
    await mongoose.connect(replset.getUri());
    const { default: app } = await import('../src/app.js');
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    const user = await User.create({ name: 'Checkout Test', email: 'checkout-test@example.com', passwordHash: 'not-a-real-password' });
    const stranger = await User.create({ name: 'Other Test', email: 'other-test@example.com', passwordHash: 'not-a-real-password' });
    const token = jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET);
    const otherToken = jwt.sign({ id: String(stranger._id) }, process.env.JWT_SECRET);
    const category = new mongoose.Types.ObjectId();
    const product = await Product.create({ name: 'Notebook', slug: 'http-e2e-notebook', price: 100, stock: 2, category });
    await Cart.create({ user: user._id, items: [{ product: product._id, quantity: 1, priceAtAdd: 100 }] });
    const request = async (method, path, body, auth = token) => {
      const response = await fetch(base + '/api' + path, {
        method,
        headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: 'Bearer ' + auth } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      return { status: response.status, data: await response.json() };
    };
    const address = { line1: 'Test street', city: 'Bangkok', province: 'Bangkok', postalCode: '10110' };
    await t.test('requires authentication for order creation', async () => {
      assert.equal((await request('POST', '/orders', { shippingAddress: address }, null)).status, 401);
    });
    const created = await request('POST', '/orders', { shippingAddress: address });
    assert.equal(created.status, 201);
    const id = created.data.data._id;
    await t.test('other users cannot view or finalize the order', async () => {
      assert.equal((await request('GET', '/orders/' + id, null, otherToken)).status, 404);
      assert.equal((await request('POST', '/payment/demo/confirm', { orderId: id, outcome: 'success' }, otherToken)).status, 404);
    });
    await t.test('success updates stock, persists paid status and rejects duplicate', async () => {
      assert.equal((await request('POST', '/payment/demo/confirm', { orderId: id, outcome: 'success' })).status, 200);
      assert.equal((await request('POST', '/payment/demo/confirm', { orderId: id, outcome: 'success' })).status, 409);
      assert.equal((await Product.findById(product._id)).stock, 1);
      const view = await request('GET', '/orders/' + id);
      assert.equal(view.status, 200);
      assert.equal(view.data.data.paymentStatus, 'paid');
      assert.equal(view.data.data.isDemo, true);
    });
    await t.test('declined order stays failed without deducting stock', async () => {
      const second = await request('POST', '/orders', { shippingAddress: address });
      assert.equal(second.status, 201);
      const secondId = second.data.data._id;
      assert.equal((await request('POST', '/payment/demo/confirm', { orderId: secondId, outcome: 'failure' })).status, 200);
      assert.equal((await Order.findById(secondId)).paymentStatus, 'failed');
      assert.equal((await Product.findById(product._id)).stock, 1);
    });
    await t.test('insufficient stock returns 409 and retains pending status', async () => {
      const third = await request('POST', '/orders', { shippingAddress: address });
      assert.equal(third.status, 201);
      await Product.updateOne({ _id: product._id }, { $set: { stock: 0 } });
      assert.equal((await request('POST', '/payment/demo/confirm', { orderId: third.data.data._id, outcome: 'success' })).status, 409);
      assert.equal((await Order.findById(third.data.data._id)).paymentStatus, 'pending');
    });
  } finally {
    if (server) await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
    await mongoose.disconnect();
    await replset.stop();
  }
});
