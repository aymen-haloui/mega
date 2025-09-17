#!/usr/bin/env node

/**
 * Script to test backend connectivity and API endpoints
 * Usage: node scripts/test-backend.js [backend-url]
 */

const BACKEND_URL = process.argv[2] || 'http://localhost:8080/api';

console.log('🧪 Testing backend connectivity...');
console.log(`Backend URL: ${BACKEND_URL}`);

// Test basic connectivity
async function testConnectivity() {
  try {
    console.log('\n1. Testing basic connectivity...');
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ Backend is reachable');
      return true;
    } else {
      console.log(`⚠️  Backend returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Backend is not reachable: ${error.message}`);
    return false;
  }
}

// Test authentication endpoint
async function testAuth() {
  try {
    console.log('\n2. Testing authentication endpoint...');
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '+213555000001',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Authentication endpoint works');
      if (data.token) {
        console.log('✅ JWT token received');
        return data.token;
      } else {
        console.log('⚠️  No token in response');
        return null;
      }
    } else {
      console.log(`❌ Authentication failed: ${response.status}`);
      const errorText = await response.text();
      console.log(`Error: ${errorText}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Authentication test failed: ${error.message}`);
    return null;
  }
}

// Test protected endpoint
async function testProtectedEndpoint(token) {
  if (!token) {
    console.log('⏭️  Skipping protected endpoint test (no token)');
    return;
  }
  
  try {
    console.log('\n3. Testing protected endpoint...');
    const response = await fetch(`${BACKEND_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Protected endpoint works');
      console.log(`✅ Received ${Array.isArray(data.data) ? data.data.length : 'unknown'} users`);
    } else {
      console.log(`❌ Protected endpoint failed: ${response.status}`);
      const errorText = await response.text();
      console.log(`Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Protected endpoint test failed: ${error.message}`);
  }
}

// Test CORS
async function testCORS() {
  try {
    console.log('\n4. Testing CORS configuration...');
    const response = await fetch(`${BACKEND_URL}/branches`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    };
    
    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log('✅ CORS is configured');
      console.log(`   Origin: ${corsHeaders['Access-Control-Allow-Origin']}`);
      console.log(`   Methods: ${corsHeaders['Access-Control-Allow-Methods']}`);
      console.log(`   Headers: ${corsHeaders['Access-Control-Allow-Headers']}`);
    } else {
      console.log('⚠️  CORS might not be properly configured');
    }
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
  }
}

// Test all required endpoints
async function testRequiredEndpoints(token) {
  console.log('\n5. Testing required endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/branches', name: 'Branches' },
    { method: 'GET', path: '/dishes', name: 'Dishes' },
    { method: 'GET', path: '/orders', name: 'Orders' },
    { method: 'GET', path: '/ingredients', name: 'Ingredients' },
    { method: 'GET', path: '/menus', name: 'Menus' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      
      if (response.ok) {
        console.log(`✅ ${endpoint.name} endpoint works`);
      } else {
        console.log(`❌ ${endpoint.name} endpoint failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} endpoint error: ${error.message}`);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('=' * 50);
  
  const isReachable = await testConnectivity();
  if (!isReachable) {
    console.log('\n❌ Backend is not reachable. Please check:');
    console.log('1. Backend server is running');
    console.log('2. Backend URL is correct');
    console.log('3. No firewall blocking the connection');
    return;
  }
  
  const token = await testAuth();
  await testProtectedEndpoint(token);
  await testCORS();
  await testRequiredEndpoints(token);
  
  console.log('\n' + '=' * 50);
  console.log('🎉 Backend testing completed!');
  
  if (token) {
    console.log('\n✅ Your backend appears to be working correctly!');
    console.log('You can now run: node scripts/switch-to-backend.js ' + BACKEND_URL);
  } else {
    console.log('\n⚠️  Some issues were found. Please check the errors above.');
    console.log('Make sure your backend implements all required endpoints.');
  }
}

// Add fetch polyfill for Node.js if needed
if (typeof fetch === 'undefined') {
  console.log('Installing fetch polyfill...');
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

runAllTests().catch(console.error);
