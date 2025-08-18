// Test receipt functionality
import mongoose from 'mongoose';
import { sendBookingReceiptEmail } from './server/services/emailService.js';
import { generateBookingReceiptHTML } from './server/templates/bookingReceiptTemplate.js';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

async function testReceiptFunctionality() {
  try {
    console.log('🧪 Testing Receipt Functionality...\n');
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Import models
    const { default: Booking } = await import('./server/models/Booking.js');
    const { default: Ground } = await import('./server/models/Ground.js');
    const { default: User } = await import('./server/models/User.js');
    
    // Find a confirmed booking with a valid ground
    console.log('\n🔍 Finding a confirmed booking...');
    const confirmedBooking = await Booking.findOne({ 
      status: 'confirmed',
      groundId: { $exists: true }
    }).sort({ createdAt: -1 });
    
    if (!confirmedBooking) {
      console.log('❌ No confirmed bookings found. Creating a test scenario...');
      
      // Find any booking and simulate it as confirmed
      const anyBooking = await Booking.findOne({}).sort({ createdAt: -1 });
      if (!anyBooking) {
        console.log('❌ No bookings found at all');
        return;
      }
      
      // Use the booking but simulate confirmed status
      confirmedBooking = anyBooking;
      confirmedBooking.status = 'confirmed';
      console.log(`📋 Using booking ${confirmedBooking.bookingId} (simulated as confirmed)`);
    } else {
      console.log(`📋 Found confirmed booking: ${confirmedBooking.bookingId}`);
    }
    
    // Get user details
    console.log('\n👤 Getting user details...');
    const user = await User.findById(confirmedBooking.userId);
    if (!user) {
      console.log('❌ User not found for booking');
      return;
    }
    console.log(`✅ User found: ${user.name} (${user.email})`);
    
    // Populate ground details
    console.log('\n🏟️ Populating ground details...');
    let bookingObj = confirmedBooking.toObject();
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bookingObj.groundId);
    
    if (isValidObjectId) {
      try {
        const mongoGround = await Ground.findById(bookingObj.groundId).select("name location price features images amenities rating owner");
        if (mongoGround) {
          bookingObj.groundId = mongoGround.toObject();
          console.log(`✅ Ground populated: ${mongoGround.name}`);
        } else {
          console.log('⚠️ Ground not found in MongoDB, using fallback');
          const { fallbackGrounds } = await import('./server/data/fallbackGrounds.js');
          const fallbackGround = fallbackGrounds.find(g => g._id === bookingObj.groundId);
          if (fallbackGround) {
            bookingObj.groundId = fallbackGround;
            console.log(`✅ Fallback ground used: ${fallbackGround.name}`);
          } else {
            console.log('❌ Ground not found anywhere');
            bookingObj.groundId = {
              _id: bookingObj.groundId,
              name: "Test Ground",
              location: { address: "Test Address", cityName: "Test City" }
            };
          }
        }
      } catch (error) {
        console.error('❌ Error populating ground:', error.message);
      }
    }
    
    // Test HTML generation
    console.log('\n📄 Testing HTML receipt generation...');
    try {
      const receiptHTML = generateBookingReceiptHTML(bookingObj, user);
      console.log('✅ HTML receipt generated successfully');
      console.log(`📏 HTML length: ${receiptHTML.length} characters`);
      
      // Check if HTML contains key elements
      const hasBookingId = receiptHTML.includes(bookingObj.bookingId);
      const hasGroundName = receiptHTML.includes(bookingObj.groundId.name);
      const hasUserName = receiptHTML.includes(user.name);
      
      console.log(`📋 Contains booking ID: ${hasBookingId ? '✅' : '❌'}`);
      console.log(`🏟️ Contains ground name: ${hasGroundName ? '✅' : '❌'}`);
      console.log(`👤 Contains user name: ${hasUserName ? '✅' : '❌'}`);
      
    } catch (error) {
      console.error('❌ Error generating HTML receipt:', error);
    }
    
    // Test email sending (this will log to console in development mode)
    console.log('\n📧 Testing email receipt sending...');
    try {
      const emailResult = await sendBookingReceiptEmail(bookingObj, user);
      console.log(`📧 Email result: ${emailResult.success ? '✅' : '❌'} ${emailResult.message}`);
      if (emailResult.messageId) {
        console.log(`📧 Message ID: ${emailResult.messageId}`);
      }
    } catch (error) {
      console.error('❌ Error sending receipt email:', error);
    }
    
    console.log('\n🎉 Receipt functionality test completed!');
    
  } catch (error) {
    console.error('❌ Error testing receipt functionality:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testReceiptFunctionality();
