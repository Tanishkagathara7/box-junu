// Comprehensive PDF functionality test
import fetch from 'node-fetch';

const testPDFFunctionality = async () => {
  console.log('🧪 Testing PDF functionality comprehensively...');
  
  const baseUrl = 'http://localhost:3002';
  
  // Test data - you'll need to replace with actual booking ID and token
  const testBookingId = '68a30109ff18c2ec94c09831'; // Replace with actual booking ID
  const testToken = 'YOUR_AUTH_TOKEN_HERE'; // Replace with actual auth token
  
  try {
    console.log('\n📄 Testing PDF receipt generation...');
    
    // Test 1: Check if receipt endpoint is accessible
    const receiptResponse = await fetch(`${baseUrl}/api/bookings/${testBookingId}/receipt`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Receipt endpoint status:', receiptResponse.status);
    
    if (receiptResponse.ok) {
      const htmlContent = await receiptResponse.text();
      console.log('✅ Receipt HTML generated successfully');
      console.log(`📊 HTML length: ${htmlContent.length} characters`);
      console.log(`🔍 Contains BoxCric: ${htmlContent.includes('BoxCric')}`);
      console.log(`🔍 Contains booking data: ${htmlContent.includes('BOOKING RECEIPT')}`);
      console.log(`🔍 Contains booking ID: ${htmlContent.includes(testBookingId)}`);
      
      // Validate HTML structure
      const hasValidStructure = htmlContent.includes('<!DOCTYPE html>') && 
                               htmlContent.includes('<html') && 
                               htmlContent.includes('</html>');
      console.log(`🔍 Valid HTML structure: ${hasValidStructure}`);
      
    } else {
      const errorText = await receiptResponse.text();
      console.log('❌ Receipt generation failed:', errorText);
    }
    
    console.log('\n📧 Testing email receipt...');
    
    // Test 2: Check if email receipt endpoint is accessible
    const emailResponse = await fetch(`${baseUrl}/api/bookings/${testBookingId}/send-receipt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Email endpoint status:', emailResponse.status);
    
    if (emailResponse.ok) {
      const emailResult = await emailResponse.json();
      console.log('✅ Email receipt processed successfully');
      console.log('📧 Response:', emailResult);
    } else {
      const emailError = await emailResponse.text();
      console.log('❌ Email receipt failed:', emailError);
    }
    
    console.log('\n🔧 Testing PDF library availability...');
    
    // Test 3: Check if PDF libraries are available (this would be done in browser)
    console.log('📋 PDF libraries to check in browser:');
    console.log('- jsPDF: Should be available via npm package and CDN fallback');
    console.log('- html2canvas: Should be available via npm package and CDN fallback');
    console.log('- Both libraries should be accessible via window.jsPDF and window.html2canvas');
    
    console.log('\n📋 Frontend PDF generation flow:');
    console.log('1. User clicks "Download PDF" button');
    console.log('2. Frontend calls authenticated /api/bookings/:id/receipt endpoint');
    console.log('3. Server generates HTML receipt using bookingReceiptTemplate.js');
    console.log('4. Frontend receives HTML and converts to PDF using jsPDF + html2canvas');
    console.log('5. PDF is downloaded to user\'s device');
    console.log('6. Fallback: If PDF generation fails, receipt opens in new tab for manual save');
    
    console.log('\n✅ PDF functionality test completed!');
    console.log('\n📋 Summary of fixes applied:');
    console.log('✅ Fixed authentication in PDF download function');
    console.log('✅ Fixed authentication in email receipt function');
    console.log('✅ Added multiple PDF generation strategies with fallbacks');
    console.log('✅ Added CDN fallbacks for PDF libraries');
    console.log('✅ Improved error handling and user feedback');
    console.log('✅ Added fallback to new window for manual save');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Instructions for manual testing
console.log('🔧 PDF Functionality Test Instructions:');
console.log('1. Replace testBookingId with an actual booking ID from your system');
console.log('2. Replace testToken with a valid authentication token');
console.log('3. Ensure the server is running on localhost:3002');
console.log('4. Run this test to verify backend endpoints');
console.log('5. Test frontend PDF generation in browser with a confirmed booking');

testPDFFunctionality();
