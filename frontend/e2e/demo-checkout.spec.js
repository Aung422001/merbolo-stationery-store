import { test, expect } from '@playwright/test';

test('checkout can simulate successful payment without Stripe', async ({ page }) => {
  const orderId = '507f1f77bcf86cd799439011';
  await page.addInitScript(() => localStorage.setItem('merbolo_token','demo-token'));
  await page.route('**/api/**', async route => {
    const url = route.request().url(), method=route.request().method();
    const json = (data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify({success:true,data})});
    if(url.includes('/auth/me')) return json({_id:'507f191e810c19729de860ea',name:'Demo User',email:'demo@example.com',role:'user'});
    if(url.includes('/cart') && method==='GET') return json({items:[{product:{_id:orderId,name:'Notebook',price:100,stock:10},quantity:1}]});
    if(url.includes('/orders') && method==='POST') return json({_id:orderId},201);
    if(url.includes('/payment/demo/confirm')) return json({_id:orderId,paymentStatus:'paid',isDemo:true});
    if(url.includes('/orders/'+orderId)) return json({_id:orderId,isDemo:true,paymentStatus:'paid',items:[{name:'Notebook',price:100,quantity:1}],subtotal:100,shippingFee:50,total:150,shippingAddress:{line1:'Test street',city:'Yangon',province:'Yangon',postalCode:'11111'}});
    return json([]);
  });
  page.on('pageerror', error => console.error('[E2E pageerror]', error.message));
  page.on('console', message => { if (message.type() === 'error') console.error('[E2E console]', message.text()); });
  await page.goto('/checkout');
  await page.waitForTimeout(2500);
  console.log('[E2E] URL:', page.url());
  console.log('[E2E] body:', (await page.locator('body').innerText()).slice(0, 1800));
  await expect(page).toHaveURL(/checkout/);
  await expect(page.getByRole('heading',{name:'Checkout'})).toBeVisible({timeout:15000});
  await expect(page.getByText('Demo Payment — No Real Money')).toBeVisible();
  await page.getByLabel('Address Line 1').fill('Test street');
  await page.getByRole('button',{name:'Create Demo Order'}).click();
  await expect(page.getByRole('button',{name:'Simulate Success'})).toBeVisible();
  await page.getByRole('button',{name:'Simulate Success'}).click();
  await expect(page.getByText('Demo payment completed.')).toBeVisible();
  await page.getByRole('button',{name:'View Demo Order'}).click();
  await expect(page.getByRole('heading',{name:'Demo Payment Completed'})).toBeVisible();
});
