// Simple test script to check bookings without population
import mongoose from 'mongoose';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

async function testBookings() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Import the Booking model
    const { default: Booking } = await import('./server/models/Booking.js');
    
    // Get first 5 bookings without population
    const bookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    console.log(`\n📋 Found ${bookings.length} recent bookings:`);
    
    bookings.forEach((booking, index) => {
      console.log(`\n--- Booking ${index + 1} ---`);
      console.log(`ID: ${booking._id}`);
      console.log(`Booking ID: ${booking.bookingId}`);
      console.log(`Ground ID: ${booking.groundId}`);
      console.log(`Ground ID Type: ${typeof booking.groundId}`);
      console.log(`Is Valid ObjectId: ${/^[0-9a-fA-F]{24}$/.test(booking.groundId)}`);
      console.log(`Date: ${booking.bookingDate}`);
      console.log(`Time Slot: ${booking.timeSlot?.startTime}-${booking.timeSlot?.endTime}`);
      console.log(`Status: ${booking.status}`);
      console.log(`Amount: ${booking.pricing?.totalAmount || 'N/A'}`);
      console.log(`Created: ${booking.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing bookings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testBookings();
