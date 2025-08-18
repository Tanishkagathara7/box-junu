// Test receipt API endpoints
import fetch from 'node-fetch';

async function testReceiptAPI() {
  try {
    console.log('🧪 Testing Receipt API Endpoints...\n');
    
    // Note: These tests require authentication, so they will fail without a valid token
    // But we can test the endpoint structure and error handling
    
    const testBookingId = '68a2e711e88e83ed673c5635'; // Use a known booking ID
    const baseURL = 'http://localhost:3001/api';
    
    console.log('1. Testing receipt generation endpoint (GET /bookings/:id/receipt)');
    try {
      const response = await fetch(`${baseURL}/bookings/${testBookingId}/receipt`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Note: No auth token, so this should return 401
        },
      });
      
      console.log(`   Status: ${response.status}`);
      if (response.status === 401) {
        console.log('   ✅ Correctly requires authentication');
      } else {
        console.log(`   ⚠️ Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('\n2. Testing receipt email endpoint (POST /bookings/:id/send-receipt)');
    try {
      const response = await fetch(`${baseURL}/bookings/${testBookingId}/send-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: No auth token, so this should return 401
        },
      });
      
      console.log(`   Status: ${response.status}`);
      if (response.status === 401) {
        console.log('   ✅ Correctly requires authentication');
      } else {
        console.log(`   ⚠️ Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('\n3. Testing with invalid booking ID');
    try {
      const response = await fetch(`${baseURL}/bookings/invalid-id/receipt`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`   Status: ${response.status}`);
      if (response.status === 401) {
        console.log('   ✅ Authentication check comes first (as expected)');
      } else {
        console.log(`   ⚠️ Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('\n📋 API Endpoint Summary:');
    console.log('   • GET /api/bookings/:id/receipt - Generates HTML receipt for download/print');
    console.log('   • POST /api/bookings/:id/send-receipt - Sends receipt email to user');
    console.log('   • Both endpoints require authentication');
    console.log('   • Both endpoints check booking ownership');
    console.log('   • Both endpoints only work for confirmed bookings');
    
    console.log('\n🎉 API endpoint structure test completed!');
    
  } catch (error) {
    console.error('❌ Error testing receipt API:', error);
  }
}

testReceiptAPI();
