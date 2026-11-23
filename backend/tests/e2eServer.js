import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';

const port = Number(process.env.PORT || 5000);
const replset = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
await mongoose.connect(replset.getUri());
const server = app.listen(port, '127.0.0.1', () => console.log('E2E_BACKEND_READY', port));

async function shutdown() {
  await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  await replset.stop();
  process.exit(0);
}
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
