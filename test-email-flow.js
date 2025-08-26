// Quick test for booking email flow
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testBookingEmailFlow() {
  console.log('🧪 Testing Complete Booking Email Flow\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. 🌐 Checking server status...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    
    if (!healthResponse.ok) {
      console.log('❌ Server is not running. Please start with: npm run dev');
      return;
    }
    
    const healthData = await healthResponse.json();
    console.log('✅ Server is running');
    console.log(`📧 Email service: ${healthData.services?.email?.status || 'unknown'}`);
    
    // Test 2: Check if we have any bookings to test with
    console.log('\n2. 🔍 Looking for test bookings...');
    
    // Try to get a test booking without auth (using test endpoint)
    try {
      const testBookingResponse = await fetch(`${API_BASE}/bookings/test-data`);
      if (testBookingResponse.ok) {
        console.log('✅ Found test bookings in database');
      }
    } catch (error) {
      console.log('⚠️  Could not check test bookings (normal if endpoint doesn\'t exist)');
    }
    
    // Test 3: Instructions for manual testing
    console.log('\n3. 📋 Manual Testing Instructions:');
    console.log('');
    console.log('To test the email functionality:');
    console.log('');
    console.log('Step 1: Configure email settings in .env file:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your-app-password');
    console.log('   EMAIL_FROM=BoxCric <your-email@gmail.com>');
    console.log('');
    console.log('Step 2: Create a new booking through the frontend:');
    console.log('   - Go to http://localhost:3000');
    console.log('   - Select a ground and time slot');
    console.log('   - Fill booking details');
    console.log('   - Submit booking');
    console.log('   - Check console for confirmation email logs');
    console.log('');
    console.log('Step 3: Complete payment:');
    console.log('   - Use test payment details');
    console.log('   - Complete payment process');
    console.log('   - Check console for receipt email logs');
    console.log('   - Check your email inbox');
    console.log('');
    console.log('Expected Console Logs:');
    console.log('   📧 Sending booking confirmation email to: user@email.com');
    console.log('   ✅ Confirmation email sent successfully!');
    console.log('   📧 Sending receipt email to: user@email.com');
    console.log('   ✅ Receipt email sent successfully!');
    console.log('');
    
    // Test 4: Show email configuration status
    console.log('4. 📧 Email Configuration Status:');
    
    if (healthData.services?.email?.status === 'configured') {
      console.log('✅ Email is properly configured');
    } else if (healthData.services?.email?.status === 'not configured') {
      console.log('⚠️  Email is not configured - emails will be logged to console');
      console.log('💡 Configure email settings in .env file to enable actual email sending');
    } else {
      console.log('❓ Email configuration status unknown');
    }
    
    console.log('\n🎉 Test completed!');
    console.log('\n📝 If emails are not working:');
    console.log('   1. Check console logs for error messages');
    console.log('   2. Verify email configuration in .env file');
    console.log('   3. Check spam/junk folder');
    console.log('   4. Run: node test-booking-email-fix.js for detailed testing');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('   - Server is running: npm run dev');
    console.log('   - MongoDB is connected');
    console.log('   - Environment variables are set');
  }
}

testBookingEmailFlow();