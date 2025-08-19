import mongoose from 'mongoose';
import Booking from './server/models/Booking.js';
import Ground from './server/models/Ground.js';
import User from './server/models/User.js';

const useExistingData = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/boxcric');
    console.log('📊 Connected to MongoDB');

    // Find existing data
    const existingGround = await Ground.findOne({});
    const existingUser = await User.findOne({});
    
    if (!existingGround || !existingUser) {
      console.log('❌ No existing data found');
      return;
    }

    console.log('🏟️ Using existing ground:', existingGround._id);
    console.log('👤 Using existing user:', existingUser._id);

    // Create a test booking with existing data
    const testBooking = new Booking({
      bookingId: "BCMEHZWHB9XC0IG",
      userId: existingUser._id,
      groundId: existingGround._id,
      bookingDate: new Date('2025-08-19'),
      timeSlot: {
        startTime: "18:00",
        endTime: "21:00",
        duration: 3
      },
      pricing: {
        baseAmount: 4500,
        discount: 0,
        taxes: 810,
        totalAmount: 5310
      },
      playerDetails: {
        teamName: "Test Team",
        playerCount: 11,
        contactPerson: {
          name: "Team Captain",
          phone: "+91 9876543210"
        }
      },
      status: "confirmed",
      payment: {
        status: "completed"
      }
    });

    await testBooking.save();
    console.log('📋 Test booking created:', testBooking._id);
    
    // Test the ground data
    console.log('\n🔍 Ground details:');
    console.log('- Name:', existingGround.name);
    console.log('- Location:', existingGround.location);
    console.log('- Owner contact:', existingGround.owner?.contact);
    
    console.log('\n✅ Test data ready!');
    console.log('🧪 Use booking ID:', testBooking._id);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

useExistingData();
