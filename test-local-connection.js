// Test script to verify local development setup
import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:8081';

async function testLocalConnection() {
  console.log('🧪 Testing Local Development Setup');
  console.log('==================================\n');

  // Test 1: Backend Health Check
  console.log('1. Testing Backend Health...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();
    console.log('✅ Backend is running');
    console.log(`   Status: ${data.status}`);
    console.log(`   MongoDB: ${data.mongoConnected ? 'Connected' : 'Disconnected'}`);
    console.log(`   Environment: ${data.environment.nodeEnv}`);
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    return;
  }

  // Test 2: API Endpoints
  console.log('\n2. Testing API Endpoints...');
  try {
    const response = await fetch(`${BACKEND_URL}/api`);
    const data = await response.json();
    console.log('✅ API info endpoint working');
    console.log(`   Message: ${data.message}`);
    console.log(`   Version: ${data.version}`);
  } catch (error) {
    console.log('❌ API endpoint failed:', error.message);
  }

  // Test 3: Test Endpoint
  console.log('\n3. Testing Test Endpoint...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/test`);
    const data = await response.json();
    console.log('✅ Test endpoint working');
    console.log(`   Success: ${data.success}`);
    console.log(`   Message: ${data.message}`);
  } catch (error) {
    console.log('❌ Test endpoint failed:', error.message);
  }

  // Test 4: Frontend Accessibility
  console.log('\n4. Testing Frontend Accessibility...');
  try {
    const response = await fetch(FRONTEND_URL);
    if (response.ok) {
      console.log('✅ Frontend is accessible');
      console.log(`   Status: ${response.status}`);
    } else {
      console.log(`❌ Frontend returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Frontend connection failed:', error.message);
  }

  console.log('\n🎉 Local Development Setup Summary:');
  console.log(`   Backend:  ${BACKEND_URL}`);
  console.log(`   Frontend: ${FRONTEND_URL}`);
  console.log('\n📝 Next Steps:');
  console.log('   1. Open your browser to http://localhost:8081');
  console.log('   2. Test the application functionality');
  console.log('   3. Check browser console for any API errors');
}

testLocalConnection();
