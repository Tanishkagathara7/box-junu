// Test email receipt functionality
import fetch from 'node-fetch';

const testEmailReceipt = async () => {
  const bookingId = '68a30109ff18c2ec94c09831';
  const baseUrl = 'http://localhost:3002';
  
  try {
    console.log('📧 Testing email receipt functionality...');
    
    const response = await fetch(`${baseUrl}/api/bookings/${bookingId}/send-receipt-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Email Response status:', response.status);
    console.log('Email Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email response:', result);
      
      if (result.developmentMode) {
        console.log('📧 Running in development mode - email logged to console');
      } else if (result.emailSent) {
        console.log('📧 Email sent successfully!');
      } else {
        console.log('⚠️ Email not sent but no error occurred');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Email Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testEmailReceipt();
