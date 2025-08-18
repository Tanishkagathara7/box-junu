// Test script to verify PDF and email fixes
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testFixes() {
  try {
    console.log('🧪 Testing PDF and Email Fixes...\n');

    // Step 1: Login to get token
    console.log('1. 🔐 Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed, creating test user...');
      
      // Create test user
      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          phone: '9876543210'
        })
      });

      if (!registerResponse.ok) {
        const error = await registerResponse.text();
        console.log('❌ Registration failed:', error);
        return;
      }

      // Try login again
      const retryLogin = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      if (!retryLogin.ok) {
        console.log('❌ Login still failed after registration');
        return;
      }

      const retryData = await retryLogin.json();
      var token = retryData.token;
    } else {
      const loginData = await loginResponse.json();
      var token = loginData.token;
    }

    console.log('✅ Login successful');

    // Step 2: Find a confirmed booking
    console.log('\n2. 🔍 Finding confirmed booking...');
    const bookingsResponse = await fetch(`${API_BASE}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!bookingsResponse.ok) {
      console.log('❌ Failed to fetch bookings');
      return;
    }

    const bookings = await bookingsResponse.json();
    const confirmedBooking = bookings.find(b => b.status === 'confirmed');

    if (!confirmedBooking) {
      console.log('❌ No confirmed booking found for testing');
      console.log('Available bookings:', bookings.map(b => ({ id: b._id, status: b.status })));
      return;
    }

    console.log('✅ Found confirmed booking:', confirmedBooking._id);

    // Step 3: Test PDF receipt generation
    console.log('\n3. 📄 Testing PDF receipt generation...');
    const receiptResponse = await fetch(`${API_BASE}/bookings/${confirmedBooking._id}/receipt`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!receiptResponse.ok) {
      const receiptError = await receiptResponse.text();
      console.log('❌ PDF receipt generation failed:', receiptError);
    } else {
      const receiptHTML = await receiptResponse.text();
      console.log('✅ PDF receipt HTML generated successfully');
      console.log(`📄 HTML length: ${receiptHTML.length} characters`);
      
      // Check for key content
      const hasBoxCric = receiptHTML.includes('BoxCric');
      const hasBookingId = receiptHTML.includes(confirmedBooking.bookingId);
      console.log(`🏏 Contains BoxCric: ${hasBoxCric}`);
      console.log(`🆔 Contains Booking ID: ${hasBookingId}`);
    }

    // Step 4: Test email receipt sending
    console.log('\n4. 📧 Testing email receipt sending...');
    const emailResponse = await fetch(`${API_BASE}/bookings/${confirmedBooking._id}/send-receipt`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📧 Email response status:', emailResponse.status);
    console.log('📧 Email response headers:', emailResponse.headers.get('content-type'));

    const emailResponseText = await emailResponse.text();
    console.log('📧 Raw email response:', emailResponseText);

    try {
      const emailData = JSON.parse(emailResponseText);
      if (emailData.success) {
        console.log('✅ Email sent successfully:', emailData.message);
        if (emailData.messageId) {
          console.log(`📧 Message ID: ${emailData.messageId}`);
        }
      } else {
        console.log('❌ Email sending failed:', emailData.message);
        if (emailData.error) {
          console.log('❌ Error details:', emailData.error);
        }
      }
    } catch (parseError) {
      console.log('❌ Failed to parse email response as JSON:', parseError.message);
      console.log('📧 Response was:', emailResponseText);
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFixes();
