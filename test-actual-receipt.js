// Test actual receipt generation with real booking ID
import fetch from 'node-fetch';

const testWithRealData = async () => {
  const bookingId = '68a30109ff18c2ec94c09831'; // From your screenshot
  const baseUrl = 'http://localhost:3002';
  
  try {
    console.log('🧪 Testing receipt generation with real booking ID...');
    
    // Test PDF endpoint
    console.log('\n📄 Testing PDF receipt endpoint...');
    const pdfResponse = await fetch(`${baseUrl}/api/bookings/${bookingId}/receipt`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('PDF Response status:', pdfResponse.status);
    console.log('PDF Response headers:', Object.fromEntries(pdfResponse.headers.entries()));
    
    if (pdfResponse.ok) {
      const htmlContent = await pdfResponse.text();
      console.log('✅ PDF HTML generated');
      console.log('📊 HTML length:', htmlContent.length);
      console.log('🔍 First 200 chars:', htmlContent.substring(0, 200));
    } else {
      const errorText = await pdfResponse.text();
      console.log('❌ PDF Error:', errorText);
    }
    
    // Test email endpoint
    console.log('\n📧 Testing email receipt endpoint...');
    const emailResponse = await fetch(`${baseUrl}/api/bookings/${bookingId}/send-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Email Response status:', emailResponse.status);
    
    if (emailResponse.ok) {
      const emailResult = await emailResponse.json();
      console.log('✅ Email response:', emailResult);
    } else {
      const emailError = await emailResponse.text();
      console.log('❌ Email Error:', emailError);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testWithRealData();
