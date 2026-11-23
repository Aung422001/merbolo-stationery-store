import { test, expect } from '@playwright/test';

const API = 'http://127.0.0.1:5000/api';
const PRODUCT_ID = '507f1f77bcf86cd799439012';

async function checkoutUser(page, request) {
  const email = 'browser-' + Math.random().toString(36).slice(2) + '@example.test';
  const registered = await request.post(API + '/auth/register', {
    data: { name: 'Browser E2E', email, password: 'test-password-123' }
  });
  expect(registered.status()).toBe(201);
  const { data } = await registered.json();
  const headers = { Authorization: 'Bearer ' + data.token };
  const cart = await request.post(API + '/cart/items', { headers, data: { productId: PRODUCT_ID, quantity: 1 } });
  expect(cart.ok()).toBeTruthy();
  await page.addInitScript(token => localStorage.setItem('merbolo_token', token), data.token);
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await page.getByLabel('Address Line 1').fill('Real API E2E street');
  await page.getByRole('button', { name: 'Create Demo Order' }).click();
  await expect(page.getByRole('button', { name: 'Simulate Success' })).toBeVisible();
  return { headers };
}

test('browser creates and pays a demo order through real Express and MongoDB', async ({ page, request }) => {
  const { headers } = await checkoutUser(page, request);
  await page.getByRole('button', { name: 'Simulate Success' }).click();
  await expect(page.getByText('Demo payment completed.')).toBeVisible();
  await page.getByRole('button', { name: 'View Demo Order' }).click();
  await expect(page.getByRole('heading', { name: 'Demo Payment Completed' })).toBeVisible();
  const id = page.url().split('/').pop();
  const response = await request.get(API + '/orders/' + id, { headers });
  expect(response.ok()).toBeTruthy();
  const { data } = await response.json();
  expect(data.isDemo).toBe(true);
  expect(data.paymentStatus).toBe('paid');
});

test('browser declines demo payment through real Express and MongoDB', async ({ page, request }) => {
  const { headers } = await checkoutUser(page, request);
  await page.getByRole('button', { name: 'Simulate Decline' }).click();
  await expect(page.getByText('Demo payment declined.')).toBeVisible();
  await page.getByRole('button', { name: 'View Demo Order' }).click();
  await expect(page.getByRole('heading', { name: 'Demo Payment Declined' })).toBeVisible();
  const id = page.url().split('/').pop();
  const response = await request.get(API + '/orders/' + id, { headers });
  expect((await response.json()).data.paymentStatus).toBe('failed');
});
