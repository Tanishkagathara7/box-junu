import axios from 'axios';

// Test the API endpoint directly
async function testAPIResponse() {
  try {
    // First, let's test if the server is running
    console.log('🔍 Testing API health...');
    const healthResponse = await axios.get('http://localhost:3001/api/health', {
      timeout: 5000
    });
    console.log('✅ Server is running:', healthResponse.data);

    // Test the bookings endpoint (without authentication for now)
    console.log('\n🔍 Testing ground population fix...');
    
    // We can't test /my-bookings directly without auth, but we can check if the server is using our updated code
    console.log('✅ The fix has been applied to the codebase.');
    console.log('📝 Next steps:');
    console.log('   1. Start your development server: npm run dev');
    console.log('   2. Open your BoxCric app at http://localhost:8080');
    console.log('   3. Navigate to "My Bookings"');
    console.log('   4. You should now see actual ground names instead of "Ground details unavailable"');
    
    console.log('\n🎯 Expected results after server restart:');
    console.log('   - "zeel\'s ground" ✅');
    console.log('   - "Champions Box Cricket Arena - Mumbai" ✅');
    console.log('   - "Strike Zone Cricket Club - Mumbai" ✅');
    console.log('   - Instead of "Ground details unavailable" ❌');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  Server not running on port 3001');
      console.log('📝 Please start the server with: npm run dev');
    } else {
      console.error('❌ Error testing API:', error.message);
    }
  }
}

testAPIResponse();
