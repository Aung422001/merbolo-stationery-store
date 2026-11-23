import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import Product from '../src/models/Product.js';

test('public product endpoints never disclose inactive products', { timeout: 180000 }, async () => {
  process.env.NODE_ENV = 'test';
  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  let server;
  try {
    await mongoose.connect(replset.getUri());
    const { default: app } = await import('../src/app.js');
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    const category = new mongoose.Types.ObjectId();
    const hidden = await Product.create({ name: 'Private item', slug: 'private-inactive-item', price: 100, stock: 1, category, isActive: false });
    const visible = await Product.create({ name: 'Visible item', slug: 'public-active-item', price: 100, stock: 1, category, isActive: true });
    const get = async path => {
      const res = await fetch(base + path);
      return { status: res.status, body: await res.json() };
    };
    for (const path of ['/api/products?includeInactive=true', '/api/products?isActive=false']) {
      const result = await get(path);
      assert.equal(result.status, 200);
      assert.ok(result.body.data.products.some(p => p._id === String(visible._id)));
      assert.ok(!result.body.data.products.some(p => p._id === String(hidden._id)));
    }
    for (const path of ['/api/products/private-inactive-item', '/api/products/' + hidden._id]) {
      const result = await get(path);
      assert.equal(result.status, 404);
    }
    assert.equal((await get('/api/products/public-active-item')).status, 200);
  } finally {
    if (server) await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
    await mongoose.disconnect();
    await replset.stop();
  }
});
