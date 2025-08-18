// Test booking details API directly
import fetch from 'node-fetch';

async function testBookingDetailsAPI() {
  try {
    // Use one of the booking IDs from the database
    const bookingId = '68a2e711e88e83ed673c5635'; // Recent booking ID
    
    console.log(`Testing booking details API for booking: ${bookingId}`);
    
    const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: This endpoint might require authentication, but let's test without first
      }
    });
    
    const data = await response.json();
    
    console.log('\n=== API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    
    if (data.success && data.booking) {
      console.log('\n=== BOOKING DETAILS ===');
      console.log('Booking ID:', data.booking.bookingId);
      console.log('Ground ID:', data.booking.groundId);
      console.log('Ground ID Type:', typeof data.booking.groundId);
      
      if (typeof data.booking.groundId === 'object') {
        console.log('Ground Name:', data.booking.groundId.name);
        console.log('Ground Location:', data.booking.groundId.location?.address);
      } else {
        console.log('Ground ID is still a string:', data.booking.groundId);
      }
      
      console.log('Status:', data.booking.status);
      console.log('Date:', data.booking.bookingDate);
      console.log('Time Slot:', `${data.booking.timeSlot?.startTime}-${data.booking.timeSlot?.endTime}`);
    } else {
      console.log('Error:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testBookingDetailsAPI();
