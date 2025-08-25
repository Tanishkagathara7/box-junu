import fetch from 'node-fetch';

async function testPDFContent() {
  console.log('🧪 Testing PDF Content Generation...\n');

  const apiBase = 'https://box-junu.onrender.com/api';
  const testBookingId = 'BCMEKANADN78YVY'; // The booking ID from the error

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
      
      // Check for specific content
      console.log('\n📋 Content Analysis:');
      console.log(`   Contains "Ground:" ${htmlContent.includes('Ground:')}`);
      console.log(`   Contains "Date:" ${htmlContent.includes('Date:')}`);
      console.log(`   Contains "Amount:" ${htmlContent.includes('Amount:')}`);
      console.log(`   Contains "Status:" ${htmlContent.includes('Status:')}`);
      console.log(`   Contains "N/A" ${htmlContent.includes('N/A')}`);
      
      // Show first 1000 characters
      console.log('\n📄 HTML Preview (first 1000 chars):');
      console.log(htmlContent.substring(0, 1000));
      
    } else {
      console.log('❌ HTML generation failed');
      console.log(`   Status: ${htmlResponse.status}`);
      const errorText = await htmlResponse.text();
      console.log(`   Error: ${errorText}`);
    }

    console.log('\n2️⃣ Testing PDF endpoint (should return HTML)...');
    
    // Test with a mock token (this will fail but we can see the error)
    const pdfResponse = await fetch(`${apiBase}/bookings/${testBookingId}/receipt-pdf`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log(`   Status: ${pdfResponse.status}`);
    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.log(`   Error: ${errorText}`);
    } else {
      const contentType = pdfResponse.headers.get('content-type');
      console.log(`   Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('text/html')) {
        const htmlContent = await pdfResponse.text();
        console.log(`   HTML length: ${htmlContent.length}`);
        console.log(`   Contains BoxCric: ${htmlContent.includes('BoxCric')}`);
        console.log(`   Contains booking ID: ${htmlContent.includes(testBookingId)}`);
        
        // Show first 500 characters
        console.log('\n📄 PDF HTML Preview (first 500 chars):');
        console.log(htmlContent.substring(0, 500));
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPDFContent();
