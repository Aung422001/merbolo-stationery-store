import test from 'node:test';
import assert from 'node:assert/strict';

test('auth endpoints enforce independent per-IP registration and login limits', async () => {
  process.env.NODE_ENV = 'test';
  const { default: app } = await import('../src/app.js');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const post = async path => {
    const response = await fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    await response.text();
    return response;
  };
  try {
    for (let i = 0; i < 5; i++) {
      assert.equal((await post('/api/auth/register')).status, 400);
    }
    const blockedRegistration = await post('/api/auth/register');
    assert.equal(blockedRegistration.status, 429);
    assert.ok(blockedRegistration.headers.get('ratelimit'));
    for (let i = 0; i < 10; i++) {
      assert.equal((await post('/api/auth/login')).status, 400);
    }
    assert.equal((await post('/api/auth/login')).status, 429);
    // Limiting auth attempts must not block unrelated health checks.
    assert.equal((await fetch(base + '/api/health')).status, 200);
  } finally {
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
});
