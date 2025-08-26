// Test script to debug PDF generation issues
import fetch from 'node-fetch';

const testPDFDebug = async () => {
  console.log('🔍 Testing PDF Generation Debug...\n');
  
  const baseUrl = 'http://localhost:3002'; // Adjust if your server runs on different port
  
  try {
    // Test 1: Check if server is running
    console.log('1. 🏥 Checking server health...');
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`);
      console.log(`   Server status: ${healthResponse.status}`);
    } catch (error) {
      console.log('   ❌ Server not responding:', error.message);
      return;
    }
    
    // Test 2: Test basic PDF generation
    console.log('\n2. 🧪 Testing basic PDF generation...');
    try {
      const testResponse = await fetch(`${baseUrl}/api/bookings/test-pdf`);
      console.log(`   Test PDF status: ${testResponse.status}`);
      
      if (testResponse.ok) {
        const contentType = testResponse.headers.get('content-type');
        console.log(`   Content-Type: ${contentType}`);
        
        if (contentType && contentType.includes('application/pdf')) {
          const buffer = await testResponse.buffer();
          console.log(`   ✅ PDF generated successfully (${buffer.length} bytes)`);
        } else {
          const text = await testResponse.text();
          console.log('   ❌ Not a PDF response:', text.substring(0, 200));
        }
      } else {
        const errorText = await testResponse.text();
        console.log('   ❌ Test PDF failed:', errorText);
      }
    } catch (error) {
      console.log('   ❌ Test PDF error:', error.message);
    }
    
    // Test 3: Test receipt HTML generation
    console.log('\n3. 📄 Testing receipt HTML generation...');
    try {
      // Use a test booking ID - you'll need to replace this with a real one
      const testBookingId = '68a30109ff18c2ec94c09831'; // Replace with actual booking ID
      const receiptResponse = await fetch(`${baseUrl}/api/bookings/${testBookingId}/receipt`, {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
        }
      });
      
      console.log(`   Receipt HTML status: ${receiptResponse.status}`);
      
      if (receiptResponse.ok) {
        const htmlContent = await receiptResponse.text();
        console.log(`   ✅ HTML generated (${htmlContent.length} characters)`);
        console.log(`   Contains BoxCric: ${htmlContent.includes('BoxCric')}`);
        console.log(`   Contains receipt title: ${htmlContent.includes('BOOKING RECEIPT')}`);
        console.log(`   HTML preview: ${htmlContent.substring(0, 200)}...`);
      } else {
        const errorText = await receiptResponse.text();
        console.log('   ❌ Receipt HTML failed:', errorText);
      }
    } catch (error) {
      console.log('   ❌ Receipt HTML error:', error.message);
    }
    
    // Test 4: Test receipt PDF generation
    console.log('\n4. 🖨️ Testing receipt PDF generation...');
    try {
      const testBookingId = '68a30109ff18c2ec94c09831'; // Replace with actual booking ID
      const pdfResponse = await fetch(`${baseUrl}/api/bookings/${testBookingId}/receipt-pdf`, {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
        }
      });
      
      console.log(`   Receipt PDF status: ${pdfResponse.status}`);
      console.log(`   Content-Type: ${pdfResponse.headers.get('content-type')}`);
      console.log(`   X-BoxCric-Receipt: ${pdfResponse.headers.get('x-boxcric-receipt')}`);
      
      if (pdfResponse.ok) {
        const contentType = pdfResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/pdf')) {
          const buffer = await pdfResponse.buffer();
          console.log(`   ✅ Receipt PDF generated (${buffer.length} bytes)`);
          
          // Check if it's a real PDF or fallback
          const pdfHeader = buffer.toString('ascii', 0, 10);
          if (pdfHeader.startsWith('%PDF')) {
            console.log('   ✅ Valid PDF header detected');
          } else {
            console.log('   ⚠️ PDF header not detected, might be fallback');
          }
        } else {
          const text = await pdfResponse.text();
          console.log('   ❌ Not a PDF response:', text.substring(0, 200));
        }
      } else {
        const errorText = await pdfResponse.text();
        console.log('   ❌ Receipt PDF failed:', errorText);
      }
    } catch (error) {
      console.log('   ❌ Receipt PDF error:', error.message);
    }
    
    console.log('\n🎉 PDF Debug Test Completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check server logs for detailed error messages');
    console.log('2. Verify Puppeteer is installed: npm install puppeteer');
    console.log('3. Check if Chrome/Chromium is available on the system');
    console.log('4. Test with a real booking ID and valid auth token');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
};

testPDFDebug();



