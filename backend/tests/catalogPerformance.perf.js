import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

test('bounded concurrent catalog reads stay responsive with a connected database', { timeout: 120000 }, async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'isolated-performance-test-secret';
  process.env.CLIENT_URL = 'http://localhost:5173';
  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  let server;
  try {
    await mongoose.connect(replset.getUri());
    const { default: app } = await import('../src/app.js');
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    const total = 100;
    const concurrency = 10;
    const durations = [];
    const statuses = [];
    const started = performance.now();
    // Allocate unique request indices independently of completion order.
    let next = 0;
    async function runWorker() {
      while (next < total) {
        const index = next++;
        const start = performance.now();
        const response = await fetch(base + '/api/products', { signal: AbortSignal.timeout(10000) });
        await response.arrayBuffer();
        durations.push(performance.now() - start);
        statuses[index] = response.status;
      }
    }
    await Promise.all(Array.from({ length: concurrency }, () => runWorker()));
    const elapsed = performance.now() - started;
    durations.sort((a, b) => a - b);
    const p95 = durations[Math.ceil(durations.length * 0.95) - 1];
    const rps = total / (elapsed / 1000);
    console.log(JSON.stringify({ scenario: 'isolated catalog GET', total, concurrency, p95_ms: Math.round(p95), throughput_rps: Math.round(rps), elapsed_ms: Math.round(elapsed) }));
    assert.equal(statuses.length, total);
    assert.ok(statuses.every(status => status === 200), 'all catalog requests should succeed');
    assert.ok(p95 < 2000, 'catalog p95 should remain below 2 seconds in CI');
    assert.ok(elapsed < 20000, '100 catalog requests should complete within 20 seconds');
  } finally {
    if (server) await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
    await mongoose.disconnect();
    await replset.stop();
  }
});
