// Test a booking that references a valid ground
import mongoose from 'mongoose';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

async function testValidBooking() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Import models
    const { default: Booking } = await import('./server/models/Booking.js');
    
    // Find a booking that references a valid ground (Champions Box Cricket Arena - Hyderabad has 39 bookings)
    const validGroundId = '686a5d1508a2ea68296f323f';
    const booking = await Booking.findOne({ groundId: validGroundId });
    
    if (!booking) {
      console.log('❌ No booking found for valid ground ID');
      return;
    }
    
    console.log(`\n📋 Found booking: ${booking.bookingId}`);
    console.log(`Ground ID: ${booking.groundId}`);
    console.log(`Ground ID Type: ${typeof booking.groundId}`);
    
    // Test the population logic (similar to what the API does)
    console.log('\n🔍 Testing population logic...');
    
    let bookingObj = booking.toObject();
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bookingObj.groundId);
    console.log(`Is Valid ObjectId: ${isValidObjectId}`);
    
    if (isValidObjectId) {
      try {
        console.log('Attempting to populate from MongoDB...');
        await booking.populate("groundId", "name location price features images amenities rating owner");
        
        // Update bookingObj with populated data
        bookingObj = booking.toObject();
        
        if (booking.groundId && typeof booking.groundId === 'object') {
          console.log(`✅ Successfully populated ground: ${booking.groundId.name}`);
          console.log(`Ground location: ${booking.groundId.location?.address}`);
        } else {
          console.log('❌ Population failed');
        }
      } catch (populateError) {
        console.error('❌ Error populating:', populateError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing valid booking:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testValidBooking();
