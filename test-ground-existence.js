// Test if grounds referenced in bookings actually exist
import mongoose from 'mongoose';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

async function testGroundExistence() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Import models
    const { default: Booking } = await import('./server/models/Booking.js');
    const { default: Ground } = await import('./server/models/Ground.js');
    
    // Get unique ground IDs from bookings
    const bookings = await Booking.find({}).limit(10).lean();
    const groundIds = [...new Set(bookings.map(b => b.groundId))];
    
    console.log(`\n📋 Found ${groundIds.length} unique ground IDs in bookings:`);
    
    for (const groundId of groundIds) {
      console.log(`\n--- Checking Ground ID: ${groundId} ---`);
      console.log(`Type: ${typeof groundId}`);
      console.log(`Is Valid ObjectId: ${/^[0-9a-fA-F]{24}$/.test(groundId)}`);
      
      // Check if ground exists in MongoDB
      let groundExists = false;
      try {
        const ground = await Ground.findById(groundId);
        if (ground) {
          groundExists = true;
          console.log(`✅ Found in MongoDB: ${ground.name}`);
        } else {
          console.log(`❌ Not found in MongoDB`);
        }
      } catch (error) {
        console.log(`❌ Error checking MongoDB: ${error.message}`);
      }
      
      // Check if ground exists in fallback data
      const { fallbackGrounds } = await import('./server/data/fallbackGrounds.js');
      const fallbackGround = fallbackGrounds.find(g => g._id === groundId);
      if (fallbackGround) {
        console.log(`✅ Found in fallback data: ${fallbackGround.name}`);
      } else {
        console.log(`❌ Not found in fallback data`);
      }
      
      if (!groundExists && !fallbackGround) {
        console.log(`🚨 PROBLEM: Ground ${groundId} doesn't exist anywhere!`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing ground existence:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testGroundExistence();
