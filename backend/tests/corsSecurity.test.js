import test from 'node:test';
import assert from 'node:assert/strict';

test('production CORS allows only the configured storefront, including preflights', async () => {
  process.env.NODE_ENV = 'production';
  process.env.CLIENT_URL = 'https://shop.example.test/';
  const { default: app } = await import('../src/app.js');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const request = (origin, method = 'GET') => fetch(base + '/api/health', {
    method,
    headers: {
      Origin: origin,
      ...(method === 'OPTIONS' ? {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type'
      } : {})
    }
  });
  try {
    const allowed = await request('https://shop.example.test');
    assert.equal(allowed.status, 200);
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://shop.example.test');
    assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true');

    const preflight = await request('https://shop.example.test', 'OPTIONS');
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://shop.example.test');

    for (const origin of [
      'https://evil.example.test',
      'https://shop.example.test.evil.test',
      'http://localhost:5173',
      'null'
    ]) {
      for (const method of ['GET', 'OPTIONS']) {
        const response = await request(origin, method);
        assert.equal(response.headers.get('access-control-allow-origin'), null, origin);
        assert.equal(response.headers.get('access-control-allow-credentials'), null, origin);
      }
    }
    const noOrigin = await fetch(base + '/api/health');
    assert.equal(noOrigin.status, 200);
    assert.equal(noOrigin.headers.get('access-control-allow-origin'), null);
  } finally {
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
});
