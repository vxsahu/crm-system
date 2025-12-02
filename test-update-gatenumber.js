// Using native fetch in Node.js 18+

const API_URL = 'http://localhost:3000/api';

async function testUpdate() {
  try {
    // 0. Authenticate
    console.log('Authenticating...');
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';
    
    // Register
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: 'Test User' })
    });

    let cookie = '';
    
    if (registerRes.ok) {
        console.log('Registered new user.');
        cookie = registerRes.headers.get('set-cookie');
    } else {
        // Try login if register fails (e.g. user exists)
        console.log('Register failed, trying login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!loginRes.ok) {
            throw new Error('Authentication failed');
        }
        cookie = loginRes.headers.get('set-cookie');
        console.log('Logged in.');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Cookie': cookie
    };

    // 1. Fetch all products
    console.log('Fetching products...');
    const res = await fetch(`${API_URL}/products`, { headers });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
    const products = await res.json();

    if (products.length === 0) {
      console.log('No products found to test.');
      return;
    }

    const product = products[0];
    console.log(`Testing with product: ${product.productName} (ID: ${product.id})`);
    console.log('Current Gate Number:', product.gateNumber);

    // 2. Update with new Gate Number
    const newGateNumber = 'G-' + Math.floor(Math.random() * 1000);
    console.log(`Updating to Gate Number: ${newGateNumber}`);

    const updateRes = await fetch(`${API_URL}/products/${product.id}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        ...product,
        gateNumber: newGateNumber
      })
    });

    if (!updateRes.ok) {
        const err = await updateRes.text();
        throw new Error(`Failed to update: ${updateRes.status} ${err}`);
    }

    const updatedProduct = await updateRes.json();
    console.log('Update response Gate Number:', updatedProduct.gateNumber);

    // 3. Verify persistence
    const verifyRes = await fetch(`${API_URL}/products`, { headers });
    const verifyProducts = await verifyRes.json();
    const verifiedProduct = verifyProducts.find(p => p.id === product.id);

    console.log('Verified Gate Number from DB:', verifiedProduct.gateNumber);

    if (verifiedProduct.gateNumber === newGateNumber) {
      console.log('SUCCESS: Gate Number updated successfully.');
    } else {
      console.error('FAILURE: Gate Number did not persist.');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUpdate();
