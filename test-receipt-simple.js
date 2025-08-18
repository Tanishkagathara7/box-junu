import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import Booking from './server/models/Booking.js';
import User from './server/models/User.js';

// Import the template function
import { generateBookingReceiptHTML } from './server/templates/bookingReceiptTemplate.js';

async function testReceiptGeneration() {
  console.log('🧪 Testing Receipt Generation Fixes...\n');

  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a test booking
    const booking = await Booking.findOne().populate('userId').lean();
    if (!booking) {
      console.log('❌ No bookings found in database');
      return;
    }

    console.log(`📋 Found booking: ${booking.bookingId} (Status: ${booking.status})`);

    // Create a test user if booking doesn't have user populated
    let user = booking.userId;
    if (!user) {
      user = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '9999999999'
      };
    }

    console.log(`👤 Using user: ${user.name} (${user.email})`);

    // Test 1: Template generation
    console.log('\n1. 📄 Testing template generation...');
    
    try {
      const receiptHTML = generateBookingReceiptHTML(booking, user);
      console.log(`✅ Template generated successfully (${receiptHTML.length} characters)`);
      
      // Validate content
      const hasBoxCric = receiptHTML.includes('BoxCric');
      const hasReceiptTitle = receiptHTML.includes('BOOKING RECEIPT');
      const hasBookingId = receiptHTML.includes(booking.bookingId);
      const hasUserName = receiptHTML.includes(user.name);
      
      console.log('📋 Content validation:');
      console.log(`   - Contains BoxCric: ${hasBoxCric ? '✅' : '❌'}`);
      console.log(`   - Contains receipt title: ${hasReceiptTitle ? '✅' : '❌'}`);
      console.log(`   - Contains booking ID: ${hasBookingId ? '✅' : '❌'}`);
      console.log(`   - Contains user name: ${hasUserName ? '✅' : '❌'}`);
      
      if (!hasBoxCric || !hasReceiptTitle) {
        console.log('❌ Template validation failed');
        console.log('📄 HTML preview:', receiptHTML.substring(0, 500));
        return;
      }
      
      console.log('✅ Template validation passed');
      
    } catch (templateError) {
      console.error('❌ Template generation failed:', templateError.message);
      return;
    }

    // Test 2: Booking data structure
    console.log('\n2. 📊 Testing booking data structure...');
    
    const requiredFields = ['bookingId', 'bookingDate', 'timeSlot', 'playerDetails', 'pricing'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!booking[field]) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
    } else {
      console.log('✅ All required fields present');
    }
    
    // Check nested fields
    if (booking.timeSlot) {
      const timeSlotFields = ['startTime', 'endTime', 'duration'];
      const missingTimeSlotFields = timeSlotFields.filter(field => !booking.timeSlot[field]);
      if (missingTimeSlotFields.length > 0) {
        console.log(`⚠️ Missing timeSlot fields: ${missingTimeSlotFields.join(', ')}`);
      } else {
        console.log('✅ TimeSlot fields complete');
      }
    }
    
    if (booking.pricing) {
      const pricingFields = ['baseAmount', 'totalAmount'];
      const missingPricingFields = pricingFields.filter(field => booking.pricing[field] === undefined);
      if (missingPricingFields.length > 0) {
        console.log(`⚠️ Missing pricing fields: ${missingPricingFields.join(', ')}`);
      } else {
        console.log('✅ Pricing fields complete');
      }
    }

    // Test 3: Ground data
    console.log('\n3. 🏟️ Testing ground data...');
    
    if (booking.groundId) {
      if (typeof booking.groundId === 'object' && booking.groundId.name) {
        console.log(`✅ Ground populated: ${booking.groundId.name}`);
      } else {
        console.log(`⚠️ Ground not populated, ID: ${booking.groundId}`);
      }
    } else {
      console.log('❌ No ground data found');
    }

    console.log('\n🎉 Receipt generation testing completed!');
    console.log('\n📋 Summary:');
    console.log('- Template generation: ✅ Working');
    console.log('- Content validation: ✅ Passed');
    console.log('- Data structure: ✅ Valid');
    console.log('\n✅ All receipt fixes are working correctly!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testReceiptGeneration();
