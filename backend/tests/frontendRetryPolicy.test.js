import test from 'node:test';
import assert from 'node:assert/strict';
import { canRetryNetworkRequest } from '../../frontend/src/api/retryPolicy.js';

test('read requests may retry a temporary network failure within the budget', () => {
  for (const method of ['get', 'head']) {
    assert.equal(canRetryNetworkRequest({ code: 'ERR_NETWORK', config: { method, __retryCount: 1 } }, 3), true);
  }
  assert.equal(canRetryNetworkRequest({ code: 'ERR_NETWORK', config: { method: 'get', __retryCount: 3 } }, 3), false);
});

test('writes and non-network errors are not automatically replayed', () => {
  for (const method of ['post', 'put', 'patch', 'delete']) {
    assert.equal(canRetryNetworkRequest({ code: 'ERR_NETWORK', config: { method } }, 3), false);
  }
  assert.equal(canRetryNetworkRequest({ code: 'ECONNABORTED', config: { method: 'get' } }, 3), false);
});
