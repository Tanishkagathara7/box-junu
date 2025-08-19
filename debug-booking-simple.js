import mongoose from 'mongoose';
import Booking from './server/models/Booking.js';
import Ground from './server/models/Ground.js';

const debugBooking = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/boxcric');
    console.log('📊 Connected to MongoDB');

    // Find any booking
    const booking = await Booking.findOne({});
    if (!booking) {
      console.log('❌ No bookings found');
      return;
    }
    
    console.log('📋 Found booking:', booking._id);
    console.log('📋 Booking groundId:', booking.groundId);
    console.log('📋 Booking groundId type:', typeof booking.groundId);
    
    // Try to find the ground
    const ground = await Ground.findById(booking.groundId);
    if (ground) {
      console.log('🏟️ Ground found:');
      console.log('- Name:', ground.name);
      console.log('- Location:', JSON.stringify(ground.location, null, 2));
      console.log('- Contact:', JSON.stringify(ground.contact, null, 2));
    } else {
      console.log('❌ Ground not found for ID:', booking.groundId);
      
      // Check all grounds
      const allGrounds = await Ground.find({}).limit(3);
      console.log('🏟️ Available grounds:');
      allGrounds.forEach(g => {
        console.log(`- ID: ${g._id}`);
        console.log(`  Name: ${g.name}`);
        console.log(`  Location: ${JSON.stringify(g.location)}`);
        console.log(`  Contact: ${JSON.stringify(g.contact)}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

debugBooking();
