// Test script to verify booking email functionality fixes
import mongoose from 'mongoose';
import { sendBookingConfirmationEmail, sendBookingReceiptEmail } from './server/services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

async function testBookingEmailFix() {
  try {
    console.log('🧪 Testing Booking Email Functionality Fixes\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const { default: Booking } = await import('./server/models/Booking.js');
    const { default: User } = await import('./server/models/User.js');
    const { default: Ground } = await import('./server/models/Ground.js');
    
    // Test 1: Check Email Configuration
    console.log('\n1. 📧 Testing email configuration...');
    const emailConfig = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
      from: process.env.EMAIL_FROM
    };
    
    console.log('📧 Email Configuration:');
    console.log('   HOST:', emailConfig.host);
    console.log('   PORT:', emailConfig.port);
    console.log('   USER:', emailConfig.user);
    console.log('   PASS:', emailConfig.pass);
    console.log('   FROM:', emailConfig.from);
    
    const isConfigComplete = emailConfig.host && emailConfig.port && emailConfig.user && emailConfig.pass !== 'NOT SET';
    console.log(`\n✅ Email configuration: ${isConfigComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
    
    if (!isConfigComplete) {
      console.log('\n⚠️  Email configuration is incomplete. Emails will be logged to console only.');
      console.log('\n📝 To configure email properly, add these to your .env file:');
      console.log('EMAIL_HOST=smtp.gmail.com');
      console.log('EMAIL_PORT=587');
      console.log('EMAIL_USER=your-email@gmail.com');
      console.log('EMAIL_PASS=your-app-password');
      console.log('EMAIL_FROM=BoxCric <your-email@gmail.com>');
    }
    
    // Test 2: Find a test booking and user
    console.log('\n2. 🔍 Finding test booking and user...');
    
    // Find a recent booking with a user
    const testBooking = await Booking.findOne({
      userId: { $exists: true }
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
    
    if (!testBooking) {
      console.log('❌ No bookings found in database');
      return;
    }
    
    console.log(`📋 Found test booking: ${testBooking.bookingId}`);
    console.log(`👤 User: ${testBooking.userId?.name || 'Unknown'} (${testBooking.userId?.email || 'No email'})`);
    console.log(`📅 Status: ${testBooking.status}`);
    
    const testUser = testBooking.userId;
    if (!testUser || !testUser.email) {
      console.log('❌ Test booking does not have a valid user with email');
      return;
    }
    
    // Get ground details
    let groundDetails = null;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(testBooking.groundId);
    
    if (isValidObjectId) {
      try {
        groundDetails = await Ground.findById(testBooking.groundId);
        if (groundDetails) {
          console.log(`🏟️  Ground: ${groundDetails.name}`);
        }
      } catch (error) {
        console.log('⚠️  Could not find ground in MongoDB, will use fallback data');
      }
    }
    
    // Create test booking object with proper ground details
    const testBookingObj = {
      ...testBooking.toObject(),
      groundId: groundDetails || {
        name: 'Test Cricket Ground',
        location: 'Test Location',
        address: '123 Test Street, Test City'
      }
    };
    
    // Test 3: Test Booking Confirmation Email
    console.log('\n3. 📧 Testing booking confirmation email...');
    try {
      // Create a test pending booking scenario
      const pendingBooking = {
        ...testBookingObj,
        status: 'pending',
        bookingId: 'TEST-CONF-' + Date.now()
      };
      
      const confirmationResult = await sendBookingConfirmationEmail(pendingBooking, testUser);
      console.log('✅ Confirmation email result:', confirmationResult);
      
      if (confirmationResult.success) {
        console.log('📧 Booking confirmation email sent successfully!');
        if (confirmationResult.messageId) {
          console.log(`📧 Message ID: ${confirmationResult.messageId}`);
        }
      } else {
        console.log('⚠️  Booking confirmation email result:', confirmationResult.message);
      }
      
    } catch (confirmationError) {
      console.error('❌ Error testing confirmation email:', confirmationError);
    }
    
    // Test 4: Test Booking Receipt Email
    console.log('\n4. 📧 Testing booking receipt email...');
    try {
      // Create a test confirmed booking scenario
      const confirmedBooking = {
        ...testBookingObj,
        status: 'confirmed',
        bookingId: 'TEST-RECEIPT-' + Date.now(),
        confirmation: {
          confirmedAt: new Date(),
          confirmationCode: 'BC' + Date.now().toString().slice(-6),
          confirmedBy: 'test'
        },
        payment: {
          status: 'completed',
          paidAt: new Date()
        }
      };
      
      const receiptResult = await sendBookingReceiptEmail(confirmedBooking, testUser);
      console.log('✅ Receipt email result:', receiptResult);
      
      if (receiptResult.success) {
        console.log('📧 Booking receipt email sent successfully!');
        if (receiptResult.messageId) {
          console.log(`📧 Message ID: ${receiptResult.messageId}`);
        }
      } else {
        console.log('⚠️  Booking receipt email result:', receiptResult.message);
      }
      
    } catch (receiptError) {
      console.error('❌ Error testing receipt email:', receiptError);
    }
    
    // Test 5: Test API Endpoints
    console.log('\n5. 🌐 Testing email API endpoints...');
    
    // Test if server is running
    try {
      const fetch = (await import('node-fetch')).default;
      const baseUrl = 'http://localhost:3001/api';
      
      // Test health check
      const healthResponse = await fetch(`${baseUrl}/health`);
      if (healthResponse.ok) {
        console.log('✅ Server is running');
        
        // Test receipt endpoint
        try {
          const receiptResponse = await fetch(`${baseUrl}/bookings/${testBooking._id}/send-receipt-test`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (receiptResponse.ok) {
            const receiptData = await receiptResponse.json();
            console.log('✅ Receipt API endpoint test:', receiptData.message);
          } else {
            console.log('⚠️  Receipt API endpoint returned error:', receiptResponse.status);
          }
        } catch (receiptApiError) {
          console.log('⚠️  Could not test receipt API endpoint:', receiptApiError.message);
        }
        
      } else {
        console.log('⚠️  Server is not running on localhost:3001');
      }
    } catch (serverError) {
      console.log('⚠️  Could not test API endpoints (server may not be running):', serverError.message);
    }
    
    console.log('\n🎉 Email functionality test completed!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Email configuration checked');
    console.log('   ✅ Booking confirmation email tested');
    console.log('   ✅ Booking receipt email tested');
    console.log('   ✅ API endpoints tested (if server running)');
    
    if (!isConfigComplete) {
      console.log('\n⚠️  IMPORTANT: Configure email settings in .env file for emails to be sent');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the test
testBookingEmailFix();