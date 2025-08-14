import axios from 'axios';

const NEW_BACKEND_URL = 'https://box-junu.onrender.com';
const OLD_BACKEND_URL = 'https://box-cash.onrender.com';

async function testBackendConnection() {
  console.log('🔍 Testing backend URL changes...\n');

  // Test new backend URL
  console.log('1. Testing NEW backend URL:', NEW_BACKEND_URL);
  try {
    const response = await axios.get(`${NEW_BACKEND_URL}/api/health`, { timeout: 10000 });
    console.log('✅ NEW backend is working!');
    console.log('   Status:', response.status);
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('❌ NEW backend failed:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Error:', error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.log('   Error: Request timeout - backend might be sleeping');
    } else {
      console.log('   Error:', error.message);
    }
  }

  console.log('\n2. Testing OLD backend URL:', OLD_BACKEND_URL);
  try {
    const response = await axios.get(`${OLD_BACKEND_URL}/api/health`, { timeout: 10000 });
    console.log('⚠️  OLD backend is still working');
    console.log('   Status:', response.status);
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('✅ OLD backend is not accessible (expected)');
    if (error.response) {
      console.log('   Status:', error.response.status);
    } else {
      console.log('   Error:', error.message);
    }
  }

  // Test specific endpoints
  console.log('\n3. Testing specific endpoints on NEW backend:');
  const endpoints = [
    '/api/test',
    '/api/grounds',
    '/api/auth/health'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${NEW_BACKEND_URL}${endpoint}`, { timeout: 5000 });
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
    } catch (error) {
      if (error.response) {
        console.log(`⚠️  ${endpoint} - Status: ${error.response.status} (${error.response.statusText})`);
      } else {
        console.log(`❌ ${endpoint} - Error: ${error.message}`);
      }
    }
  }

  console.log('\n📋 Summary:');
  console.log('- If NEW backend is working: ✅ URL change successful');
  console.log('- If NEW backend fails: ❌ Check Render deployment');
  console.log('- Make sure your Render service is named "box-junu"');
  console.log('- Webhook URL in payments should point to: https://box-junu.onrender.com/api/payments/webhook');
}

testBackendConnection();
