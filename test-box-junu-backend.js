import fetch from 'node-fetch';

async function testBoxJunuBackend() {
  const BACKEND_URL = 'https://box-junu.onrender.com';
  
  console.log('🔍 Testing box-junu backend...');
  console.log('URL:', BACKEND_URL);
  
  try {
    console.log('\n⏳ Attempting to wake up the service (this may take 30-60 seconds)...');
    
    // First request to wake up the service
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      timeout: 60000, // 60 seconds timeout
      headers: {
        'User-Agent': 'BoxCric-Test/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is working!');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
      
      // Test a few more endpoints
      console.log('\n🧪 Testing additional endpoints...');
      
      const endpoints = [
        '/api/test',
        '/api/grounds'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const testResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
            timeout: 10000
          });
          console.log(`✅ ${endpoint} - Status: ${testResponse.status}`);
        } catch (err) {
          console.log(`❌ ${endpoint} - Error: ${err.message}`);
        }
      }
      
    } else {
      console.log('❌ Backend responded with error');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
    }
    
  } catch (error) {
    console.log('❌ Backend test failed:');
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      console.log('   Error: Request timeout - service might be sleeping or not deployed');
      console.log('   💡 Try visiting https://box-junu.onrender.com in your browser to wake it up');
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testBoxJunuBackend();
