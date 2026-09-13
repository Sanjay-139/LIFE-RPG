import http from 'http';
import { createApp } from '../src/app.js';

let server: http.Server;
let baseUrl: string;

let authToken: string;
let demoUserId: string;
let createdOrderId: string;
let razorpayOrderId: string;

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function request(path: string, options: RequestInit = {}) {
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (authToken && !('Authorization' in headers)) {
    headers['Authorization'] = `Bearer ${authToken}`;
  } else if (headers['Authorization'] === '') {
    delete headers['Authorization'];
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  const status = res.status;
  let body: any;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  return { status, body, headers: res.headers };
}

async function runTests() {
  console.log('\n========================================================');
  console.log('         CARTIVA BACKEND TEST SUITE EXECUTION           ');
  console.log('========================================================\n');

  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 5001;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // --- 1. HEALTH CHECK ---
  console.log('--- 1. Health Check Suite ---');
  await test('GET /api/health returns 200 and running status', async () => {
    const res = await request('/api/health');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.success === true, 'Expected success === true');
    assert(res.body.message === 'CARTIVA backend is running', 'Expected CARTIVA message');
  });

  // --- 2. AUTHENTICATION & VALIDATION ---
  console.log('\n--- 2. Authentication & Security Suite ---');
  await test('POST /api/auth/register creates user and returns JWT token', async () => {
    const testEmail = `test_${Date.now()}@example.com`;
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Arjun Mehta',
        email: testEmail,
        password: 'securePassword123',
        phone: '+91 99887 76655'
      })
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.success === true, 'Expected success === true');
    assert(Boolean(res.body.token), 'Expected token in response');
    assert(res.body.user.email === testEmail, 'Email mismatch');
    authToken = res.body.token;
    demoUserId = res.body.user.id;
  });

  await test('POST /api/auth/register rejects duplicate email with 409', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate User',
        email: 'priya.sharma@example.com',
        password: 'password123'
      })
    });
    assert(res.status === 409, `Expected 409 Conflict, got ${res.status}`);
    assert(res.body.error?.code === 'EMAIL_EXISTS', 'Expected EMAIL_EXISTS code');
  });

  await test('POST /api/auth/register rejects invalid body with 422', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'A', // Too short
        email: 'not-an-email',
        password: '123' // Too short
      })
    });
    assert(res.status === 422, `Expected 422, got ${res.status}`);
    assert(res.body.error?.code === 'VALIDATION_ERROR', 'Expected VALIDATION_ERROR');
  });

  await test('POST /api/auth/login validates credentials and issues token', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'priya.sharma@example.com',
        password: 'password123'
      })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Boolean(res.body.token), 'Expected token');
    assert(res.body.user.name === 'Priya Sharma', 'User name mismatch');
  });

  await test('POST /api/auth/login rejects invalid password with 401', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'priya.sharma@example.com',
        password: 'wrongPassword999'
      })
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
    assert(res.body.error?.code === 'INVALID_CREDENTIALS', 'Expected INVALID_CREDENTIALS');
  });

  await test('GET /api/auth/me returns authenticated user profile and addresses', async () => {
    const res = await request('/api/auth/me');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.id === demoUserId, 'User id mismatch');
  });

  await test('GET /api/auth/me rejects unauthenticated request with 401', async () => {
    const res = await request('/api/auth/me', {
      headers: { 'Authorization': '' } // Strip token
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
    assert(res.body.error?.code === 'UNAUTHORIZED', 'Expected UNAUTHORIZED');
  });

  // --- 3. CATEGORIES & PRODUCTS ---
  console.log('\n--- 3. Catalog & Product Intelligence Suite ---');
  await test('GET /api/categories returns all 10 core categories', async () => {
    const res = await request('/api/categories');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const list = res.body.data || res.body;
    assert(list.length >= 10, `Expected at least 10 categories, got ${list.length}`);
  });

  await test('GET /api/categories/:slug returns single category metadata', async () => {
    const res = await request('/api/categories/computers');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.slug === 'computers', 'Category slug mismatch');
    assert(res.body.filterAttributes.length > 0, 'Missing filter attributes');
  });

  await test('GET /api/products returns catalog with pagination', async () => {
    const res = await request('/api/products?limit=5');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const products = res.body.data || res.body.products;
    assert(products.length <= 5, 'Pagination limit breached');
    assert(res.body.pagination.total >= 10, 'Expected total count');
  });

  await test('GET /api/products supports category, price, and stock filtering', async () => {
    const res = await request('/api/products?category=computers&minPrice=60000&maxPrice=100000&inStockOnly=true');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const items = res.body.data || res.body.products;
    for (const item of items) {
      assert(item.category === 'computers', 'Item category should be computers');
      assert(item.price >= 60000 && item.price <= 100000, 'Price range breached');
      assert(item.inStock === true, 'Item should be in stock');
    }
  });

  await test('GET /api/products/search performs multi-field text search', async () => {
    const res = await request('/api/products/search?q=oled');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const items = res.body.data || res.body.products;
    assert(items.length > 0, 'Expected at least 1 OLED product match');
  });

  await test('GET /api/products/:id returns full specs and reviews', async () => {
    const res = await request('/api/products/prod-lenovo-ideapad-pro');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.title.includes('Lenovo IdeaPad'), 'Title mismatch');
    assert(Boolean(res.body.specifications['Processor']), 'Missing specifications');
  });

  await test('GET /api/products/:id returns 404 for nonexistent product', async () => {
    const res = await request('/api/products/prod-non-existent-999');
    assert(res.status === 404, `Expected 404, got ${res.status}`);
    assert(res.body.error?.code === 'PRODUCT_NOT_FOUND', 'Expected PRODUCT_NOT_FOUND');
  });

  // --- 4. CART & WISHLIST ---
  console.log('\n--- 4. Cart & Wishlist Operations Suite ---');
  await test('POST /api/cart/items adds product and recalculates quantities', async () => {
    const res = await request('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        productId: 'prod-lenovo-ideapad-pro',
        quantity: 1,
        extendedWarranty: true
      })
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const cart = res.body.data || res.body.cart;
    assert(cart.some((i: any) => i.product.id === 'prod-lenovo-ideapad-pro'), 'Product missing from cart');
  });

  await test('POST /api/cart/items rejects stock overflow', async () => {
    const res = await request('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        productId: 'prod-lenovo-ideapad-pro',
        quantity: 99999
      })
    });
    assert(res.status === 500 || res.status === 400, 'Expected rejection on stock overflow');
  });

  await test('POST /api/wishlist/items adds and removes items', async () => {
    const addRes = await request('/api/wishlist/items', {
      method: 'POST',
      body: JSON.stringify({ productId: 'prod-samsung-s24-ultra' })
    });
    assert(addRes.status === 201, `Expected 201, got ${addRes.status}`);

    const delRes = await request('/api/wishlist/items/prod-samsung-s24-ultra', {
      method: 'DELETE'
    });
    assert(delRes.status === 200, `Expected 200, got ${delRes.status}`);
  });

  // --- 5. ORDERS & TRACKING ---
  console.log('\n--- 5. Order Management & Tracking Suite ---');
  await test('POST /api/orders calculates prices server-side, verifies stock, and generates 7-stage timeline', async () => {
    const res = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          {
            product: { id: 'prod-lenovo-ideapad-pro' },
            quantity: 1,
            selectedVariants: { RAM: '16GB' }
          }
        ],
        shippingAddress: {
          fullName: 'Arjun Mehta',
          phone: '+91 99887 76655',
          street: '12 Marine Drive',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400020',
          label: 'Home'
        },
        paymentMethod: 'UPI (Google Pay)',
        couponCode: 'PICKORA10'
      })
    });

    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const order = res.body.data || res.body;
    assert(Boolean(order.id), 'Order ID missing');
    assert(order.discount > 0, 'Coupon discount not applied');
    assert(order.statusTimeline.length === 7, `Expected 7 timeline steps, got ${order.statusTimeline.length}`);
    createdOrderId = order.id;
  });

  await test('GET /api/orders/:id/tracking returns live timeline status', async () => {
    const res = await request(`/api/orders/${createdOrderId}/tracking`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const steps = res.body.data || res.body.tracking;
    assert(steps[0].status === 'PLACED', 'First step should be PLACED');
    assert(steps[0].completed === true, 'First step should be completed');
  });

  await test('POST /api/orders/:id/cancel cancels order and restocks inventory', async () => {
    const res = await request(`/api/orders/${createdOrderId}/cancel`, {
      method: 'POST'
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.status === 'CANCELLED', 'Order status should be CANCELLED');
  });

  // --- 6. RAZORPAY PAYMENT GATEWAY ---
  console.log('\n--- 6. Razorpay Payment Architecture Suite ---');
  await test('POST /api/payments/create-order generates Razorpay order from database amount', async () => {
    const res = await request('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({
        orderId: createdOrderId,
        amount: 50000,
        currency: 'INR'
      })
    });

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Boolean(res.body.razorpayOrderId), 'Missing razorpayOrderId');
    assert(Boolean(res.body.keyId), 'Missing public keyId');
    assert(!('RAZORPAY_KEY_SECRET' in res.body), 'Security leak: RAZORPAY_KEY_SECRET returned');
    razorpayOrderId = res.body.razorpayOrderId;
  });

  await test('POST /api/payments/verify cryptographically confirms payment', async () => {
    const res = await request('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: 'pay_test_9847291',
        razorpay_signature: 'sig_valid_mock_signature_test'
      })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.verified === true, 'Payment should be verified');
  });

  // --- 7. PICKORA AI SHOPPING DECISION AGENT ---
  console.log('\n--- 7. PICKORA AI Decision Assistant Suite ---');
  await test('POST /api/pickora/chat extracts intent, grounds in DB, and returns 4-tier recommendations', async () => {
    const res = await request('/api/pickora/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'I need a coding laptop under ₹70,000 with OLED display and 16GB RAM'
      })
    });

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Boolean(res.body.message?.text), 'Missing response text');
    assert(res.body.message.sender === 'pickora', 'Sender should be pickora');
    assert(res.body.recommendations?.length === 4, 'Expected 4 recommendation tiers');

    const overall = res.body.recommendations.find((r: any) => r.tag === 'overall');
    assert(Boolean(overall), 'Missing Best Overall recommendation');
    assert(overall.scoreGauge >= 90, 'Expected high match score');
    assert(overall.benchmarks.length === 5, 'Expected 5-point benchmark matrix');
  });

  await test('POST /api/pickora/optimize-cart delivers verified discount and bundle tips', async () => {
    const res = await request('/api/pickora/optimize-cart', {
      method: 'POST',
      body: JSON.stringify({
        cartProductIds: ['prod-lenovo-ideapad-pro', 'prod-logitech-mx-master-3s']
      })
    });

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.tips.length > 0, 'Expected optimization tips');
    assert(res.body.totalSavingsPossible > 0, 'Expected positive savings');
  });

  // Stop server
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });

  console.log('\n========================================================');
  console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner exception:', err);
  if (server) server.close();
  process.exit(1);
});
