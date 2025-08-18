// Test direct ground lookup
import mongoose from 'mongoose';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

async function testGroundDirect() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Import models
    const { default: Ground } = await import('./server/models/Ground.js');
    
    // Test direct ground lookup
    const validGroundId = '686a5d1508a2ea68296f323f';
    console.log(`\n🔍 Testing direct ground lookup for ID: ${validGroundId}`);
    
    const ground = await Ground.findById(validGroundId);
    
    if (ground) {
      console.log(`✅ Ground found: ${ground.name}`);
      console.log(`Location: ${ground.location?.address}`);
      console.log(`City: ${ground.location?.cityName}`);
      console.log(`Price: ₹${ground.price?.perHour}/hour`);
    } else {
      console.log('❌ Ground not found');
    }
    
    // Test with ObjectId conversion
    console.log('\n🔍 Testing with ObjectId conversion...');
    const groundWithObjectId = await Ground.findById(new mongoose.Types.ObjectId(validGroundId));
    
    if (groundWithObjectId) {
      console.log(`✅ Ground found with ObjectId: ${groundWithObjectId.name}`);
    } else {
      console.log('❌ Ground not found with ObjectId');
    }
    
    // List all grounds to see what's available
    console.log('\n📍 All available grounds:');
    const allGrounds = await Ground.find({}).select('_id name location.cityName');
    allGrounds.forEach((g, index) => {
      console.log(`${index + 1}. ${g.name} (${g.location?.cityName}) - ID: ${g._id}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing ground direct:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testGroundDirect();
