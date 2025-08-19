// Test receipt generation without authentication
import fetch from 'node-fetch';

const testReceiptNoAuth = async () => {
  const bookingId = '68a30109ff18c2ec94c09831';
  const baseUrl = 'http://localhost:3002';
  
  try {
    console.log('🧪 Testing receipt generation without auth...');
    
    // Test the new test endpoint
    const response = await fetch(`${baseUrl}/api/bookings/${bookingId}/receipt-test`);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const htmlContent = await response.text();
      console.log('✅ Receipt HTML generated successfully!');
      console.log('📊 HTML length:', htmlContent.length);
      console.log('🔍 Contains booking data:', htmlContent.includes('BOOKING RECEIPT'));
      console.log('🔍 Contains BoxCric:', htmlContent.includes('BoxCric'));
      console.log('🔍 First 300 chars:', htmlContent.substring(0, 300));
      
      // Save to file for inspection
      const fs = await import('fs');
      fs.writeFileSync('test-receipt-output.html', htmlContent);
      console.log('💾 Saved receipt to test-receipt-output.html');
      
    } else {
      const errorText = await response.text();
      console.log('❌ Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testReceiptNoAuth();
