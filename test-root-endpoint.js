import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

async function testRootEndpoint() {
  console.log('🧪 Testing Root Endpoint');
  console.log('========================');
  console.log(`Testing URL: ${BASE_URL}/`);
  
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Root endpoint is working!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Root endpoint failed!');
    console.log('Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
  
  console.log('\n🧪 Testing Health Endpoint');
  console.log('==========================');
  console.log(`Testing URL: ${BASE_URL}/api/health`);
  
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health endpoint is working!');
    console.log('Status:', response.data.status);
    console.log('MongoDB:', response.data.mongoConnected ? '✅ Connected' : '❌ Disconnected');
  } catch (error) {
    console.log('❌ Health endpoint failed!');
    console.log('Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testRootEndpoint(); 