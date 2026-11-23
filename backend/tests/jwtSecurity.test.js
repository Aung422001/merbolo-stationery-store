import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { generateToken } from '../src/utils/generateToken.js';

test('JWT signing refuses missing secret instead of using predictable fallback', () => {
  const old = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  try { assert.throws(() => generateToken('507f191e810c19729de860ea', 'customer'), /JWT_SECRET must be configured/); }
  finally { if (old !== undefined) process.env.JWT_SECRET = old; }
});

test('JWT signing uses configured secret and expiration', () => {
  const old = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'isolated-unit-test-secret';
  try {
    const token = generateToken('507f191e810c19729de860ea', 'customer');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    assert.equal(payload.role, 'customer');
    assert.ok(payload.exp > payload.iat);
  } finally { if (old === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = old; }
});
