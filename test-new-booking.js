// Test receipt generation with the new booking that has proper ground data
import fetch from 'node-fetch';

const testNewBooking = async () => {
  const bookingId = '68a47d1f37c20f4188b5d8ef';
  const baseUrl = 'http://localhost:3002';
  
  console.log('🧪 Testing receipt with new booking data...\n');
  
  try {
    // Test PDF Receipt HTML Generation
    console.log('📄 Testing PDF receipt HTML...');
    const pdfResponse = await fetch(`${baseUrl}/api/bookings/${bookingId}/receipt-test`);
    
    if (pdfResponse.ok) {
      const htmlContent = await pdfResponse.text();
      console.log('✅ PDF HTML generated successfully');
      console.log(`📊 HTML length: ${htmlContent.length} characters`);
      
      // Check for venue details in HTML
      const hasGroundName = htmlContent.includes('Cricket boxing');
      const hasLocation = htmlContent.includes('Rajkott');
      const hasContact = htmlContent.includes('Contact not available') || htmlContent.includes('+91');
      
      console.log('🏟️ Venue details in HTML:', {
        hasGroundName,
        hasLocation,
        hasContact
      });
      
      // Save HTML for inspection
      const fs = await import('fs');
      fs.writeFileSync('test-new-receipt.html', htmlContent);
      console.log('💾 HTML saved to test-new-receipt.html');
      
    } else {
      console.log('❌ PDF HTML generation failed:', await pdfResponse.text());
    }
    
    // Test Email Receipt
    console.log('\n📧 Testing email receipt...');
    const emailResponse = await fetch(`${baseUrl}/api/bookings/${bookingId}/send-receipt-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (emailResponse.ok) {
      const emailResult = await emailResponse.json();
      console.log('✅ Email response:', emailResult);
    } else {
      console.log('❌ Email sending failed:', await emailResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testNewBooking();
