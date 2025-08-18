// Test what grounds are actually available
import mongoose from 'mongoose';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

async function testAvailableGrounds() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Import models
    const { default: Ground } = await import('./server/models/Ground.js');
    
    // Check MongoDB grounds
    const mongoGrounds = await Ground.find({}).limit(10);
    console.log(`\n📍 MongoDB Grounds (${mongoGrounds.length} found):`);
    mongoGrounds.forEach((ground, index) => {
      console.log(`${index + 1}. ${ground.name} (ID: ${ground._id})`);
    });
    
    // Check fallback grounds
    const { fallbackGrounds } = await import('./server/data/fallbackGrounds.js');
    console.log(`\n📍 Fallback Grounds (${fallbackGrounds.length} found):`);
    fallbackGrounds.forEach((ground, index) => {
      console.log(`${index + 1}. ${ground.name} (ID: ${ground._id})`);
    });
    
    // Check if any bookings reference existing grounds
    const { default: Booking } = await import('./server/models/Booking.js');
    const allGroundIds = [
      ...mongoGrounds.map(g => g._id.toString()),
      ...fallbackGrounds.map(g => g._id)
    ];
    
    console.log(`\n🔍 Checking if any bookings reference existing grounds...`);
    for (const groundId of allGroundIds) {
      const bookingCount = await Booking.countDocuments({ groundId });
      if (bookingCount > 0) {
        const groundName = mongoGrounds.find(g => g._id.toString() === groundId)?.name || 
                          fallbackGrounds.find(g => g._id === groundId)?.name;
        console.log(`✅ ${groundName} (${groundId}): ${bookingCount} bookings`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing available grounds:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAvailableGrounds();
