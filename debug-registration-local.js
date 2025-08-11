console.log('🔍 Starting comprehensive registration debug (LOCAL)...\n');

const baseURL = 'http://localhost:3001';

// Generate unique test data
const uniqueId = Math.floor(Math.random() * 10000);
const testUser = {
  name: `Test User ${uniqueId}`,
  email: `test${uniqueId}@example.com`,
  phone: `+91${9000000000 + uniqueId}`,
  password: 'SecurePass123!',
  role: 'customer'
};

console.log('📋 Test User Data:', JSON.stringify(testUser, null, 2));

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.text();
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = data;
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      data: parsedData,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      error: error.message,
      type: error.name
    };
  }
}

async function debugRegistration() {
  console.log('1. Testing health endpoint...');
  const healthCheck = await makeRequest(`${baseURL}/`);
  console.log('Health Response:', JSON.stringify(healthCheck, null, 2));
  
  if (healthCheck.error) {
    console.log('❌ Backend is not accessible');
    return;
  }
  
  console.log('\n2. Testing registration endpoint...');
  const registrationResponse = await makeRequest(`${baseURL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  
  console.log('📤 Registration Request:', JSON.stringify(testUser, null, 2));
  console.log('📥 Registration Response:', JSON.stringify(registrationResponse, null, 2));
  
  if (registrationResponse.status === 201) {
    console.log('✅ Registration successful!');
    console.log('📧 Check server logs for OTP information');
  } else if (registrationResponse.status === 409) {
    console.log('⚠️  User already exists (expected for duplicate tests)');
  } else if (registrationResponse.status >= 400) {
    console.log('❌ Registration failed with client/server error');
    if (registrationResponse.data && registrationResponse.data.message) {
      console.log('Error message:', registrationResponse.data.message);
    }
    if (registrationResponse.data && registrationResponse.data.details) {
      console.log('Error details:', registrationResponse.data.details);
    }
  } else {
    console.log('🤔 Unexpected response status');
  }
  
  console.log('\n3. Testing user check endpoint...');
  const checkResponse = await makeRequest(`${baseURL}/api/auth/check-user`, {
    method: 'POST',
    body: JSON.stringify({ email: testUser.email })
  });
  
  console.log('User Check Response:', JSON.stringify(checkResponse, null, 2));
}

debugRegistration().catch(console.error);
