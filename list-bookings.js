import mongoose from 'mongoose';
import Booking from './server/models/Booking.js';

const listBookings = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/boxcric');
    console.log('📊 Connected to MongoDB');

    const bookings = await Booking.find({});
    console.log('📋 All bookings:');
    bookings.forEach(b => {
      console.log(`- ID: ${b._id}`);
      console.log(`  BookingID: ${b.bookingId}`);
      console.log(`  GroundID: ${b.groundId}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

listBookings();
