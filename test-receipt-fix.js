// Test script to verify PDF and email receipt fixes
const fetch = require('node-fetch');

const testReceiptGeneration = async () => {
  console.log('🧪 Testing receipt generation fixes...');
  
  // Test data - replace with actual booking ID from your system
  const testBookingId = 'YOUR_BOOKING_ID_HERE'; // Replace with actual booking ID
  const testToken = 'YOUR_AUTH_TOKEN_HERE'; // Replace with actual auth token
  
  try {
    console.log('\n📄 Testing PDF receipt generation...');
    const pdfResponse = await fetch(`http://localhost:5000/api/bookings/${testBookingId}/receipt`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (pdfResponse.ok) {
      const htmlContent = await pdfResponse.text();
      console.log('✅ PDF receipt HTML generated successfully');
      console.log(`📊 HTML length: ${htmlContent.length} characters`);
      console.log(`🔍 Contains booking data: ${htmlContent.includes('BoxCric') && htmlContent.length > 1000}`);
    } else {
      console.log('❌ PDF generation failed:', pdfResponse.status, pdfResponse.statusText);
    }
    
    console.log('\n📧 Testing email receipt...');
    const emailResponse = await fetch(`http://localhost:5000/api/bookings/${testBookingId}/send-receipt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const emailResult = await emailResponse.json();
    if (emailResult.success) {
      console.log('✅ Email receipt processed successfully');
      console.log('📧 Message:', emailResult.message);
    } else {
      console.log('❌ Email receipt failed:', emailResult.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

console.log('🔧 Receipt Fix Test Script');
console.log('📝 Instructions:');
console.log('1. Replace YOUR_BOOKING_ID_HERE with an actual confirmed booking ID');
console.log('2. Replace YOUR_AUTH_TOKEN_HERE with your auth token');
console.log('3. Make sure your server is running on localhost:5000');
console.log('4. Run: node test-receipt-fix.js');
console.log('\n📧 Email Configuration:');
console.log('Add these to your .env file:');
console.log('EMAIL_HOST=smtp.gmail.com');
console.log('EMAIL_PORT=587');
console.log('EMAIL_USER=your-email@gmail.com');
console.log('EMAIL_PASS=your-app-password');
console.log('EMAIL_FROM=BoxCric <your-email@gmail.com>');

// Uncomment to run test
// testReceiptGeneration();
