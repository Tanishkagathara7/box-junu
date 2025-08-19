// Test receipt endpoints with proper authentication
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const testWithAuth = async () => {
  const bookingId = '68a30109ff18c2ec94c09831';
  const baseUrl = 'http://localhost:3002';
  
  // Create a test token (you'll need to replace with actual JWT_SECRET)
  const testUserId = '66c1234567890abcdef12345'; // Replace with actual user ID
  const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';
  
  try {
    const token = jwt.sign({ userId: testUserId }, jwtSecret, { expiresIn: '1h' });
    console.log('🔑 Generated test token');
    
    // Test PDF endpoint with auth
    console.log('\n📄 Testing PDF receipt with authentication...');
    const pdfResponse = await fetch(`${baseUrl}/api/bookings/${bookingId}/receipt`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('PDF Response status:', pdfResponse.status);
    
    if (pdfResponse.ok) {
      const htmlContent = await pdfResponse.text();
      console.log('✅ PDF HTML generated');
      console.log('📊 HTML length:', htmlContent.length);
      console.log('🔍 Contains booking data:', htmlContent.includes('BOOKING RECEIPT'));
    } else {
      const errorText = await pdfResponse.text();
      console.log('❌ PDF Error:', errorText);
    }
    
    // Test email endpoint with auth
    console.log('\n📧 Testing email receipt with authentication...');
    const emailResponse = await fetch(`${baseUrl}/api/bookings/${bookingId}/send-receipt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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

// Also test without auth to see the difference
const testWithoutAuth = async () => {
  const bookingId = '68a30109ff18c2ec94c09831';
  const baseUrl = 'http://localhost:3002';
  
  console.log('\n🚫 Testing without authentication (should fail)...');
  
  try {
    const response = await fetch(`${baseUrl}/api/bookings/${bookingId}/receipt`);
    console.log('No-auth response status:', response.status);
    const content = await response.text();
    console.log('No-auth response:', content);
  } catch (error) {
    console.error('No-auth test error:', error);
  }
};

console.log('🧪 Starting authentication tests...');
testWithoutAuth().then(() => testWithAuth());
