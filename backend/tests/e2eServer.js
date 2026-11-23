import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';

// Isolated CI-only secret: the real app must provide JWT_SECRET via its environment.
process.env.JWT_SECRET = 'isolated-e2e-only-jwt-secret-not-for-production';
const port = Number(process.env.PORT || 5000);
const replset = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
await mongoose.connect(replset.getUri());
const category = await Category.create({ name: 'E2E stationery', slug: 'e2e-stationery' });
await Product.create({ _id: '507f1f77bcf86cd799439012', name: 'E2E Notebook', slug: 'e2e-notebook', category: category._id, price: 100, stock: 10 });
const server = app.listen(port, '127.0.0.1', () => console.log('E2E_BACKEND_READY', port));

async function shutdown() {
  await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  await replset.stop();
  process.exit(0);
}
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
