import axios from 'axios';

const testRegistration = async () => {
  try {
    // Generate a unique email for testing
    const uniqueEmail = `test${Date.now()}@example.com`;
    const uniquePhone = `${Date.now().toString().slice(-10)}`;
    
    console.log('Testing with:', {
      name: 'Test User',
      email: uniqueEmail,
      phone: uniquePhone,
      password: 'testpass123'
    });
    
    const response = await axios.post('https://box-new.onrender.com/api/auth/register', {
      name: 'Test User',
      email: uniqueEmail,
      phone: uniquePhone,
      password: 'testpass123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('Success response:');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.error('Error details:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Headers:', error.response?.headers);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    
    if (error.message) {
      console.error('Error Message:', error.message);
    }
    
    // If it's a network error
    if (error.request && !error.response) {
      console.error('Network Error - no response received');
      console.error('Request config:', error.config);
    }
  }
};

// Test the health endpoint first
const testHealth = async () => {
  try {
    const response = await axios.get('https://box-new.onrender.com/api/health');
    console.log('Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('Health check failed:', error.response?.data || error.message);
    return false;
  }
};

const runTests = async () => {
  console.log('🔍 Starting comprehensive registration debug...\n');
  
  console.log('1. Testing health endpoint...');
  const healthOk = await testHealth();
  
  if (!healthOk) {
    console.log('❌ Health check failed. Stopping tests.');
    return;
  }
  
  console.log('✅ Health check passed.\n');
  
  console.log('2. Testing registration endpoint...');
  await testRegistration();
  
  console.log('\n🏁 Debug complete.');
};

runTests();
