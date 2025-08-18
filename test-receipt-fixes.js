import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE = 'http://localhost:3001/api';

// Test user credentials (you may need to adjust these)
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

async function testReceiptFixes() {
  console.log('🧪 Testing Receipt Generation and Email Fixes...\n');

  try {
    // Step 1: Login to get auth token
    console.log('1. 🔐 Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed. Creating test user...');
      
      // Try to register the user first
      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...TEST_USER,
          name: 'Test User',
          phone: '9999999999'
        }),
      });

      if (!registerResponse.ok) {
        const registerError = await registerResponse.text();
        console.log('❌ Registration failed:', registerError);
        return;
      }

      // Try login again
      const retryLoginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(TEST_USER),
      });

      if (!retryLoginResponse.ok) {
        console.log('❌ Login still failed after registration');
        return;
      }

      const retryLoginData = await retryLoginResponse.json();
      var token = retryLoginData.token;
    } else {
      const loginData = await loginResponse.json();
      var token = loginData.token;
    }

    console.log('✅ Login successful');

    // Step 2: Get user's bookings
    console.log('\n2. 📋 Fetching user bookings...');
    const bookingsResponse = await fetch(`${API_BASE}/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!bookingsResponse.ok) {
      console.log('❌ Failed to fetch bookings');
      return;
    }

    const bookingsData = await bookingsResponse.json();
    console.log(`✅ Found ${bookingsData.bookings?.length || 0} bookings`);

    if (!bookingsData.bookings || bookingsData.bookings.length === 0) {
      console.log('⚠️ No bookings found. Creating a test booking...');
      
      // Create a test booking
      const testBooking = {
        groundId: 'ground_1',
        bookingDate: new Date().toISOString().split('T')[0],
        timeSlot: {
          startTime: '10:00',
          endTime: '12:00',
          duration: 2
        },
        playerDetails: {
          teamName: 'Test Team',
          playerCount: 8,
          contactPerson: {
            name: 'Test User',
            phone: '9999999999',
            email: 'test@example.com'
          },
          requirements: 'Test booking for receipt testing'
        }
      };

      const createBookingResponse = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(testBooking),
      });

      if (!createBookingResponse.ok) {
        const createError = await createBookingResponse.text();
        console.log('❌ Failed to create test booking:', createError);
        return;
      }

      const newBookingData = await createBookingResponse.json();
      console.log('✅ Test booking created:', newBookingData.booking.bookingId);
      
      // Use the new booking for testing
      bookingsData.bookings = [newBookingData.booking];
    }

    // Find a confirmed booking or use the first one
    let testBooking = bookingsData.bookings.find(b => b.status === 'confirmed') || bookingsData.bookings[0];
    
    if (!testBooking) {
      console.log('❌ No suitable booking found for testing');
      return;
    }

    console.log(`📋 Using booking: ${testBooking.bookingId} (Status: ${testBooking.status})`);

    // Step 3: Test receipt HTML generation
    console.log('\n3. 📄 Testing receipt HTML generation...');
    const receiptResponse = await fetch(`${API_BASE}/bookings/${testBooking._id}/receipt`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!receiptResponse.ok) {
      const receiptError = await receiptResponse.text();
      console.log('❌ Receipt generation failed:', receiptError);
      return;
    }

    const receiptHTML = await receiptResponse.text();
    console.log(`✅ Receipt HTML generated (${receiptHTML.length} characters)`);
    
    // Validate HTML content
    const hasBoxCric = receiptHTML.includes('BoxCric');
    const hasReceiptTitle = receiptHTML.includes('BOOKING RECEIPT');
    const hasBookingId = receiptHTML.includes(testBooking.bookingId);
    
    console.log(`📋 HTML validation:`);
    console.log(`   - Contains BoxCric: ${hasBoxCric ? '✅' : '❌'}`);
    console.log(`   - Contains receipt title: ${hasReceiptTitle ? '✅' : '❌'}`);
    console.log(`   - Contains booking ID: ${hasBookingId ? '✅' : '❌'}`);

    if (!hasBoxCric || !hasReceiptTitle) {
      console.log('❌ HTML content validation failed');
      console.log('📄 HTML preview:', receiptHTML.substring(0, 500));
      return;
    }

    // Step 4: Test email sending (only for confirmed bookings)
    if (testBooking.status === 'confirmed') {
      console.log('\n4. 📧 Testing receipt email sending...');
      const emailResponse = await fetch(`${API_BASE}/bookings/${testBooking._id}/send-receipt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!emailResponse.ok) {
        const emailError = await emailResponse.text();
        console.log('❌ Email sending failed:', emailError);
      } else {
        const emailData = await emailResponse.json();
        console.log('✅ Email sent successfully:', emailData.message);
        if (emailData.messageId) {
          console.log(`📧 Message ID: ${emailData.messageId}`);
        }
      }
    } else {
      console.log('\n4. ⚠️ Skipping email test (booking not confirmed)');
    }

    console.log('\n🎉 Receipt fixes testing completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testReceiptFixes();
