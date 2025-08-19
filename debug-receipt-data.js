// Debug script to check actual booking data and receipt generation
import mongoose from 'mongoose';
import Booking from './server/models/Booking.js';
import User from './server/models/User.js';
import Ground from './server/models/Ground.js';
import { generateBookingReceiptHTML } from './server/templates/bookingReceiptTemplate.js';
import { fallbackGrounds } from './server/data/fallbackGrounds.js';
import dotenv from 'dotenv';

dotenv.config();

const debugBookingData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boxcric');
    console.log('✅ Connected to MongoDB');

    // Find a confirmed booking to test with
    const confirmedBooking = await Booking.findOne({ status: 'confirmed' }).sort({ createdAt: -1 });
    
    if (!confirmedBooking) {
      console.log('❌ No confirmed bookings found');
      return;
    }

    console.log('📋 Found confirmed booking:', confirmedBooking.bookingId);
    console.log('🔍 Raw booking data:', JSON.stringify(confirmedBooking.toObject(), null, 2));

    // Get user data
    const user = await User.findById(confirmedBooking.userId);
    console.log('👤 User data:', user ? { name: user.name, email: user.email } : 'User not found');

    // Process ground data like the API does
    let bookingObj = confirmedBooking.toObject();
    const originalGroundId = bookingObj.groundId;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(originalGroundId);

    console.log(`🏟️ Ground ID: ${originalGroundId}, isValidObjectId: ${isValidObjectId}`);

    if (isValidObjectId) {
      try {
        const mongoGround = await Ground.findById(originalGroundId);
        if (mongoGround) {
          bookingObj.groundId = mongoGround.toObject();
          console.log('✅ MongoDB ground found:', mongoGround.name);
        } else {
          const fallbackGround = fallbackGrounds.find(g => g._id === originalGroundId);
          if (fallbackGround) {
            bookingObj.groundId = fallbackGround;
            console.log('✅ Fallback ground found:', fallbackGround.name);
          } else {
            console.log('❌ No ground found anywhere');
          }
        }
      } catch (error) {
        console.error('❌ Error finding ground:', error);
      }
    } else {
      const fallbackGround = fallbackGrounds.find(g => g._id === originalGroundId);
      if (fallbackGround) {
        bookingObj.groundId = fallbackGround;
        console.log('✅ Fallback ground found:', fallbackGround.name);
      }
    }

    // Check data completeness
    console.log('\n📊 Data completeness check:');
    console.log('- Booking ID:', bookingObj.bookingId || 'MISSING');
    console.log('- Ground name:', bookingObj.groundId?.name || 'MISSING');
    console.log('- Ground location:', bookingObj.groundId?.location?.address || 'MISSING');
    console.log('- Booking date:', bookingObj.bookingDate || 'MISSING');
    console.log('- Time slot:', bookingObj.timeSlot || 'MISSING');
    console.log('- Player details:', bookingObj.playerDetails || 'MISSING');
    console.log('- Pricing:', bookingObj.pricing || 'MISSING');

    // Test HTML generation
    try {
      const html = generateBookingReceiptHTML(bookingObj, user);
      console.log('\n✅ HTML generated successfully');
      console.log('📄 HTML length:', html.length);
      console.log('🔍 Contains booking ID:', html.includes(bookingObj.bookingId));
      console.log('🔍 Contains ground name:', html.includes(bookingObj.groundId?.name || ''));
      
      // Save HTML to file for inspection
      const fs = await import('fs');
      fs.writeFileSync('./debug-receipt.html', html);
      console.log('💾 HTML saved to debug-receipt.html');
      
    } catch (templateError) {
      console.error('❌ Template generation failed:', templateError);
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

debugBookingData();
