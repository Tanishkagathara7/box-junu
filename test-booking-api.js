// Test script to check booking API response
const fetch = require('node-fetch');

async function testBookingAPI() {
  try {
    // You'll need to replace this with an actual booking ID from your database
    const bookingId = '6784b0a6fdd84e13b98b0a12'; // Replace with actual booking ID
    const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('=== BOOKING API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.booking) {
      console.log('\n=== GROUND DATA ANALYSIS ===');
      console.log('booking.groundId type:', typeof data.booking.groundId);
      console.log('booking.groundId value:', data.booking.groundId);
      console.log('booking.ground type:', typeof data.booking.ground);
      console.log('booking.ground value:', data.booking.ground);
      
      if (data.booking.groundId && typeof data.booking.groundId === 'object') {
        console.log('Ground Name:', data.booking.groundId.name);
        console.log('Ground Address:', data.booking.groundId.location?.address);
      } else if (data.booking.ground && typeof data.booking.ground === 'object') {
        console.log('Ground Name:', data.booking.ground.name);
        console.log('Ground Address:', data.booking.ground.location?.address);
      } else {
        console.log('❌ No proper ground data found!');
      }
    }

  } catch (error) {
    console.error('Error testing booking API:', error);
  }
}

testBookingAPI();
