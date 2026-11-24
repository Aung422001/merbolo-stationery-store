import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { validateProductionConfig } from '../src/config/productionConfig.js';
import { resolveBackendOrigin } from '../../frontend/api/proxy.js';

test('production config accepts explicit fixture configuration without network access', () => {
  assert.doesNotThrow(() => validateProductionConfig({
    NODE_ENV: 'production',
    JWT_SECRET: randomBytes(32).toString('hex'),
    MONGODB_URI: 'mongodb://database.example.test:27017/fixture',
    CLIENT_URL: 'https://shop.example.test',
    PORT: '10000'
  }));
  assert.doesNotThrow(() => validateProductionConfig({ NODE_ENV: 'test' }));
});

test('production config reports missing fields without exposing their values', () => {
  assert.throws(() => validateProductionConfig({ NODE_ENV: 'production' }),
    /JWT_SECRET.*MONGODB_URI.*CLIENT_URL/);
  assert.throws(() => validateProductionConfig({
    NODE_ENV: 'production',
    JWT_SECRET: 'replace_with_a_long_random_string',
    MONGODB_URI: 'mongodb://database.example.test:27017/fixture',
    CLIENT_URL: 'https://shop.example.test',
    PORT: '70000'
  }), error => error.message.includes('JWT_SECRET') && error.message.includes('PORT') &&
    !error.message.includes('replace_with_a_long_random_string'));
});

test('deployed proxy requires explicitly configured backend origin', () => {
  assert.equal(resolveBackendOrigin({ BACKEND_URL: 'https://staging.example.test/' }), 'https://staging.example.test');
  assert.equal(resolveBackendOrigin({}), null);
  assert.equal(resolveBackendOrigin({ VITE_API_URL: 'https://staging.example.test/api' }), null);
  assert.equal(resolveBackendOrigin({ BACKEND_URL: 'http://staging.example.test' }), null);
  assert.equal(resolveBackendOrigin({ BACKEND_URL: 'https://staging.example.test/api' }), null);
});

test('liveness and database readiness are distinct without a database connection', async (t) => {
  process.env.NODE_ENV = 'test';
  process.env.CLIENT_URL = 'http://localhost:5173';
  const { default: app } = await import('../src/app.js');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve())));
  const base = 'http://127.0.0.1:' + server.address().port;
  const live = await fetch(base + '/api/health');
  assert.equal(live.status, 200);
  await live.json();
  const ready = await fetch(base + '/api/ready');
  assert.equal(ready.status, 503);
  assert.deepEqual(await ready.json(), { status: 'unavailable' });
});
