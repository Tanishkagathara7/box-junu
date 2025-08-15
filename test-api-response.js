import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './server/models/Booking.js';
import Ground from './server/models/Ground.js';
import User from './server/models/User.js';
import { fallbackGrounds } from './server/data/fallbackGrounds.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

async function simulateMyBookingsAPI() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a user with bookings
    console.log('👤 Finding a user with bookings...');
    const user = await User.findOne({});
    if (!user) {
      console.log('❌ No users found');
      return;
    }
    
    console.log(`Found user: ${user.name} (${user._id})`);

    // Get user's bookings (simulate the API logic)
    console.log('📋 Fetching user bookings...');
    const bookings = await Booking.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`Found ${bookings.length} bookings for user`);

    // Process bookings exactly like the updated API does
    const processedBookings = [];
    for (const booking of bookings) {
      let bookingObj = booking.toObject();
      const originalGroundId = bookingObj.groundId;
      
      console.log(`\n🔍 Processing booking ${booking.bookingId}:`);
      console.log(`   Original groundId: ${originalGroundId}`);
      
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(originalGroundId);
      console.log(`   Is valid ObjectId: ${isValidObjectId}`);
      
      if (isValidObjectId) {
        try {
          // Try population first
          await booking.populate("groundId", "name location price features images amenities rating owner");
          
          if (booking.groundId && typeof booking.groundId === 'object' && booking.groundId.name) {
            bookingObj.groundId = booking.groundId;
            console.log(`   ✅ Mongoose populate SUCCESS: ${booking.groundId.name}`);
          } else {
            // Try direct lookup
            console.log(`   ⚠️  Mongoose populate failed, trying direct lookup...`);
            const mongoGround = await Ground.findById(originalGroundId);
            
            if (mongoGround) {
              bookingObj.groundId = mongoGround.toObject();
              console.log(`   ✅ Direct lookup SUCCESS: ${mongoGround.name}`);
            } else {
              console.log(`   ❌ No ground found in MongoDB for ID: ${originalGroundId}`);
              // Check fallback grounds
              const fallbackGround = fallbackGrounds.find(g => g._id === originalGroundId);
              if (fallbackGround) {
                bookingObj.groundId = fallbackGround;
                console.log(`   ✅ Found in fallback: ${fallbackGround.name}`);
              } else {
                console.log(`   ❌ Not found in fallback either`);
              }
            }
          }
        } catch (error) {
          console.log(`   ❌ Error during lookup: ${error.message}`);
          
          // Try direct lookup as final attempt
          try {
            const mongoGround = await Ground.findById(originalGroundId);
            if (mongoGround) {
              bookingObj.groundId = mongoGround.toObject();
              console.log(`   ✅ Recovered with direct lookup: ${mongoGround.name}`);
            }
          } catch (directError) {
            console.log(`   ❌ Direct lookup also failed: ${directError.message}`);
          }
        }
      }

      // Final check
      if (typeof bookingObj.groundId === 'string') {
        console.log(`   🔧 Creating minimal ground object for: ${bookingObj.groundId}`);
        bookingObj.groundId = {
          _id: bookingObj.groundId,
          name: `Ground #${bookingObj.groundId.substring(0, 6)}`,
          location: { address: "Address not available" },
          price: { perHour: 0 },
          features: { capacity: 0, pitchType: "Unknown" },
          images: [],
          amenities: [],
          rating: { average: 0, count: 0 },
          owner: { name: "Unknown", contact: "N/A", email: "N/A" }
        };
      }

      console.log(`   📋 Final result: ${bookingObj.groundId.name}`);
      processedBookings.push(bookingObj);
    }

    console.log('\n📊 SUMMARY:');
    processedBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.bookingId}: "${booking.groundId.name}" (${booking.status})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

simulateMyBookingsAPI();
