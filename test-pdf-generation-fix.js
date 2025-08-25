import fetch from 'node-fetch';

async function testPDFGeneration() {
  console.log('🧪 Testing PDF Generation Fix...\n');

  const apiBase = 'https://box-junu.onrender.com/api';
  const testBookingId = 'BCMEKWOCPP1KPWE'; // The booking ID from the error

  try {
    console.log('1️⃣ Testing receipt HTML generation...');
    
    // Test the receipt HTML endpoint
    const htmlResponse = await fetch(`${apiBase}/bookings/${testBookingId}/receipt-test`);
    
    if (htmlResponse.ok) {
      const htmlContent = await htmlResponse.text();
      console.log('✅ HTML generation successful');
      console.log(`   Content length: ${htmlContent.length} characters`);
      console.log(`   Contains BoxCric: ${htmlContent.includes('BoxCric')}`);
      console.log(`   Contains booking ID: ${htmlContent.includes(testBookingId)}`);
      console.log(`   Contains receipt title: ${htmlContent.includes('BOOKING RECEIPT')}`);
    } else {
      console.log('❌ HTML generation failed');
      console.log(`   Status: ${htmlResponse.status}`);
      const errorText = await htmlResponse.text();
      console.log(`   Error: ${errorText}`);
    }

    console.log('\n2️⃣ Testing authenticated receipt endpoint...');
    
    // Test with a mock token (this will fail but we can see the error)
    const authResponse = await fetch(`${apiBase}/bookings/${testBookingId}/receipt`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log(`   Status: ${authResponse.status}`);
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.log(`   Error: ${errorText}`);
    }

    console.log('\n3️⃣ Testing PDF endpoint...');
    
    const pdfResponse = await fetch(`${apiBase}/bookings/${testBookingId}/receipt-pdf`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log(`   Status: ${pdfResponse.status}`);
    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.log(`   Error: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPDFGeneration();
