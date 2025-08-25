// Debug ground data to see what's actually in the database
import mongoose from 'mongoose';
import Ground from './server/models/Ground.js';
import Booking from './server/models/Booking.js';

const debugGroundData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boxcric');
    console.log('📊 Connected to MongoDB');

    const bookingId = '68a30109ff18c2ec94c09831';
    
    // Get the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.log('❌ Booking not found');
      return;
    }
    
    console.log('📋 Booking groundId:', booking.groundId);
    console.log('📋 Booking groundId type:', typeof booking.groundId);
    
    // Try to find the ground
    const ground = await Ground.findById(booking.groundId);
    if (ground) {
      console.log('🏟️ Ground found in database:');
      console.log('- Name:', ground.name);
      console.log('- Location:', ground.location);
      console.log('- Contact:', ground.contact);
      console.log('- Owner:', ground.owner);
      console.log('- Full ground object:', JSON.stringify(ground.toObject(), null, 2));
    } else {
      console.log('❌ Ground not found in database');
      
      // List all grounds to see what's available
      const allGrounds = await Ground.find({}).limit(5);
      console.log('🏟️ Available grounds in database:');
      allGrounds.forEach(g => {
        console.log(`- ${g._id}: ${g.name} (${g.location?.city || 'No city'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

debugGroundData();
