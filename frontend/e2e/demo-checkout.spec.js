import { test, expect } from '@playwright/test';

const ORDER_ID = '507f1f77bcf86cd799439011';
const PRODUCT_ID = '507f1f77bcf86cd799439012';
const USER_ID = '507f191e810c19729de860ea';
const order = (status = 'paid') => ({
  _id: ORDER_ID, isDemo: true, paymentStatus: status,
  items: [{ name: 'Notebook', price: 100, quantity: 1 }],
  subtotal: 100, shippingFee: 50, total: 150,
  shippingAddress: { line1: 'Test street', city: 'Bangkok', province: 'Bangkok', postalCode: '10110' }
});

async function setup(page, { orderFailure = false, paymentFailure = false, outOfStock = false } = {}) {
  const calls = { orders: 0, payments: [], requests: 0 };
  await page.addInitScript(() => localStorage.setItem('merbolo_token', 'demo-token'));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (!url.pathname.startsWith('/api/')) return route.continue();
    const method = route.request().method();
    const json = (data, status = 200, success = true, message) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ success, data, message }) });
    if (url.pathname.endsWith('/auth/me')) return json({ _id: USER_ID, name: 'Demo User', email: 'demo@example.com', role: 'customer' });
    if (url.pathname.endsWith('/cart') && method === 'GET')
      return json({ items: [{ product: { _id: PRODUCT_ID, name: 'Notebook', price: 100, stock: 10 }, quantity: 1 }] });
    if (url.pathname.endsWith('/orders') && method === 'POST') {
      calls.orders++;
      if (orderFailure) return json(null, 503, false, 'Order service unavailable');
      if (outOfStock) return json(null, 400, false, 'Invalid quantity or insufficient stock');
      return json({ _id: ORDER_ID }, 201);
    }
    if (url.pathname.endsWith('/payment/demo/confirm')) {
      const body = route.request().postDataJSON();
      calls.payments.push(body.outcome);
      if (paymentFailure) return json(null, 503, false, 'Payment service unavailable');
      return json(order(body.outcome === 'failure' ? 'failed' : 'paid'));
    }
    if (url.pathname.endsWith('/orders/' + ORDER_ID)) {
      calls.requests++;
      return json(order(calls.payments.at(-1) === 'failure' ? 'failed' : 'paid'));
    }
    return json([]);
  });
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  return calls;
}

async function createDemoOrder(page) {
  await page.getByLabel('Address Line 1').fill('Test street');
  await page.getByRole('button', { name: 'Create Demo Order' }).click();
}

test('successful demo checkout and confirmation', async ({ page }) => {
  const calls = await setup(page);
  await createDemoOrder(page);
  await page.getByRole('button', { name: 'Simulate Success' }).click();
  await expect(page.getByText('Demo payment completed.')).toBeVisible();
  await page.getByRole('button', { name: 'View Demo Order' }).click();
  await expect(page.getByRole('heading', { name: 'Demo Payment Completed' })).toBeVisible();
  expect(calls.orders).toBe(1);
  expect(calls.payments).toEqual(['success']);
});

test('declined demo payment shows failure and allows a new order', async ({ page }) => {
  const calls = await setup(page);
  await createDemoOrder(page);
  await page.getByRole('button', { name: 'Simulate Decline' }).click();
  await expect(page.getByText('Demo payment declined.')).toBeVisible();
  await page.getByRole('button', { name: 'View Demo Order' }).click();
  await expect(page.getByRole('heading', { name: 'Demo Payment Declined' })).toBeVisible();
  expect(calls.payments).toEqual(['failure']);
});

test('declined payment can start a new demo order and succeed', async ({ page }) => {
  const calls = await setup(page);
  await createDemoOrder(page);
  await page.getByRole('button', { name: 'Simulate Decline' }).click();
  await page.getByRole('button', { name: 'Try a New Demo Order' }).click();
  await createDemoOrder(page);
  await page.getByRole('button', { name: 'Simulate Success' }).click();
  await expect(page.getByText('Demo payment completed.')).toBeVisible();
  expect(calls.orders).toBe(2);
  expect(calls.payments).toEqual(['failure', 'success']);
});

test('insufficient inventory prevents payment controls', async ({ page }) => {
  const calls = await setup(page, { outOfStock: true });
  await createDemoOrder(page);
  await expect(page.getByText('Invalid quantity or insufficient stock')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate Success' })).toHaveCount(0);
  expect(calls.payments).toHaveLength(0);
});

test('order API error is displayed without starting payment', async ({ page }) => {
  await setup(page, { orderFailure: true });
  await createDemoOrder(page);
  await expect(page.getByText('Order service unavailable')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate Success' })).toHaveCount(0);
});

test('payment API error keeps payment controls available for retry', async ({ page }) => {
  const calls = await setup(page, { paymentFailure: true });
  await createDemoOrder(page);
  await page.getByRole('button', { name: 'Simulate Success' }).click();
  await expect(page.getByText('Payment service unavailable')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate Success' })).toBeEnabled();
  expect(calls.payments).toEqual(['success']);
});

test('mobile checkout is usable at 390px width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await createDemoOrder(page);
  await page.getByRole('button', { name: 'Simulate Success' }).click();
  await expect(page.getByText('Demo payment completed.')).toBeVisible();
  await page.getByRole('button', { name: 'View Demo Order' }).click();
  await expect(page.getByRole('heading', { name: 'Demo Payment Completed' })).toBeVisible();
});
