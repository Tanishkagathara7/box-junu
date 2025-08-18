// Test the fixed booking details logic
import mongoose from 'mongoose';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

async function testBookingFix() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Import models and data
    const { default: Booking } = await import('./server/models/Booking.js');
    const { default: Ground } = await import('./server/models/Ground.js');
    const { fallbackGrounds } = await import('./server/data/fallbackGrounds.js');
    
    // Test with a valid ground ID
    const validGroundId = '686a5d1508a2ea68296f323f';
    const booking = await Booking.findOne({ groundId: validGroundId });
    
    if (!booking) {
      console.log('❌ No booking found for valid ground ID');
      return;
    }
    
    console.log(`\n📋 Testing booking: ${booking.bookingId}`);
    console.log(`Original Ground ID: ${booking.groundId}`);
    
    // Simulate the fixed logic
    let bookingObj = booking.toObject();
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bookingObj.groundId);
    console.log(`Is Valid ObjectId: ${isValidObjectId}`);
    
    if (isValidObjectId) {
      try {
        console.log("Attempting to find ground in MongoDB...");
        const mongoGround = await Ground.findById(bookingObj.groundId).select("name location price features images amenities rating owner");
        
        if (mongoGround) {
          bookingObj.groundId = mongoGround.toObject();
          console.log(`✅ Successfully found ground in MongoDB: ${mongoGround.name}`);
          console.log(`Ground location: ${mongoGround.location?.address}`);
          console.log(`Ground city: ${mongoGround.location?.cityName}`);
        } else {
          console.log("MongoDB ground not found, trying fallback...");
          const fallbackGround = fallbackGrounds.find(g => g._id === bookingObj.groundId);
          if (fallbackGround) {
            bookingObj.groundId = fallbackGround;
            console.log(`✅ Using fallback ground: ${fallbackGround.name}`);
          }
        }
      } catch (mongoError) {
        console.error("Error finding ground in MongoDB:", mongoError.message);
      }
    } else {
      // Find in fallback data
      console.log("Using fallback grounds for non-ObjectId...");
      const fallbackGround = fallbackGrounds.find(g => g._id === bookingObj.groundId);
      if (fallbackGround) {
        bookingObj.groundId = fallbackGround;
        console.log(`✅ Successfully found ground in fallback: ${fallbackGround.name}`);
      }
    }
    
    // Final check
    if (typeof bookingObj.groundId === 'string') {
      console.log("⚠️ Ground could not be populated, creating minimal ground object");
      bookingObj.groundId = {
        _id: bookingObj.groundId,
        name: "Ground details unavailable",
        location: { 
          address: "Address not available",
          cityName: "Unknown City"
        }
      };
    }
    
    console.log(`\n🎯 Final result:`);
    console.log(`Ground Name: ${bookingObj.groundId.name}`);
    console.log(`Ground Address: ${bookingObj.groundId.location?.address}`);
    
  } catch (error) {
    console.error('❌ Error testing booking fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testBookingFix();
