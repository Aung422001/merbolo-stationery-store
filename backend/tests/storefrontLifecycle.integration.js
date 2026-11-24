import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

test('storefront account, catalog and cart lifecycle', async (t) => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'local-regression-fixture-only-not-a-deployment-secret';
  process.env.CLIENT_URL = 'http://localhost:5173';
  const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  t.after(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });
  await mongoose.connect(mongo.getUri());
  const { default: app } = await import('../src/app.js');
  const { default: User } = await import('../src/models/User.js');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve())));
  const base = 'http://127.0.0.1:' + server.address().port + '/api';

  async function request(method, path, { token, body, status = 200 } = {}) {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const json = await response.json();
    assert.equal(response.status, status, method + ' ' + path + ': ' + json.message);
    return json.data;
  }

  const customer = { name: 'Regression Customer', email: 'customer@example.test', password: 'fixture-password-123' };
  const admin = { name: 'Regression Admin', email: 'admin@example.test', password: 'fixture-password-456' };
  let customerToken, adminToken, categoryId, productId;

  await t.test('register, login and account profile', async () => {
    const registered = await request('POST', '/auth/register', { body: customer, status: 201 });
    assert.equal(registered.user.email, customer.email);
    assert.equal(registered.user.role, 'customer');
    assert.ok(registered.token);
    await request('POST', '/auth/register', { body: customer, status: 400 });
    await request('POST', '/auth/login', { body: { ...customer, password: 'incorrect-password' }, status: 401 });
    const loggedIn = await request('POST', '/auth/login', { body: customer });
    customerToken = loggedIn.token;
    const profile = await request('GET', '/auth/me', { token: customerToken });
    assert.equal(profile.email, customer.email);
    assert.equal(profile.passwordHash, undefined);
    const createdAdmin = await request('POST', '/auth/register', { body: admin, status: 201 });
    await User.updateOne({ _id: createdAdmin.user._id }, { $set: { role: 'admin' } });
    const adminLogin = await request('POST', '/auth/login', { body: admin });
    adminToken = adminLogin.token;
    assert.equal(adminLogin.user.role, 'admin');
  });

  await t.test('category create, list and update', async () => {
    const category = await request('POST', '/categories', { token: adminToken, status: 201, body: { name: 'Regression Stationery' } });
    categoryId = category._id;
    assert.equal(category.slug, 'regression-stationery');
    const updated = await request('PUT', '/categories/' + categoryId, { token: adminToken, body: { description: 'Office supplies' } });
    assert.equal(updated.description, 'Office supplies');
    const categories = await request('GET', '/categories');
    assert.ok(categories.some(item => item._id === categoryId));
  });

  await t.test('product create, detail, filtering and inventory update', async () => {
    const product = await request('POST', '/products', { token: adminToken, status: 201, body: {
      name: 'Regression Notebook', price: 125, stock: 10, category: categoryId
    } });
    productId = product._id;
    assert.equal(product.category._id, categoryId);
    const updated = await request('PUT', '/products/' + productId, { token: adminToken, body: { stock: 12 } });
    assert.equal(updated.stock, 12);
    const detail = await request('GET', '/products/regression-notebook');
    assert.equal(detail.price, 125);
    const catalog = await request('GET', '/products?category=regression-stationery&sort=price-asc');
    assert.equal(catalog.total, 1);
    assert.equal(catalog.products[0]._id, productId);
  });

  await t.test('cart add, update, current-price totals and remove', async () => {
    const empty = await request('GET', '/cart', { token: customerToken });
    assert.equal(empty.items.length, 0);
    const add = quantity => request('POST', '/cart/items', { token: customerToken, body: { productId, quantity } });
    const first = await add(2);
    assert.equal(first.items[0].quantity, 2);
    const combined = await add(1);
    assert.equal(combined.items.length, 1);
    assert.equal(combined.items[0].quantity, 3);
    const updated = await request('PUT', '/cart/items/' + productId, { token: customerToken, body: { quantity: 4 } });
    assert.equal(updated.items[0].product.price * updated.items[0].quantity, 500);
    await request('PUT', '/cart/items/' + productId, { token: customerToken, body: { quantity: -1 }, status: 400 });
    const removed = await request('DELETE', '/cart/items/' + productId, { token: customerToken });
    assert.equal(removed.items.length, 0);
  });

  await t.test('catalog cleanup through admin CRUD', async () => {
    await request('DELETE', '/products/' + productId, { token: adminToken });
    const catalog = await request('GET', '/products');
    assert.equal(catalog.total, 0);
    await request('DELETE', '/categories/' + categoryId, { token: adminToken });
    const categories = await request('GET', '/categories');
    assert.equal(categories.length, 0);
  });
});
