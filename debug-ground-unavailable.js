import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './server/models/Booking.js';
import Ground from './server/models/Ground.js';
import { fallbackGrounds } from './server/data/fallbackGrounds.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

async function debugGroundUnavailable() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all bookings
    console.log('\n📋 Fetching all bookings...');
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).limit(20);
    console.log(`Found ${bookings.length} recent bookings`);

    // Get all grounds from MongoDB
    console.log('\n🏟️ Fetching grounds from MongoDB...');
    const mongoGrounds = await Ground.find({});
    console.log(`Found ${mongoGrounds.length} grounds in MongoDB`);
    
    console.log('\n📁 Fallback grounds available:');
    fallbackGrounds.forEach((ground, index) => {
      console.log(`  ${index + 1}. ${ground._id} - ${ground.name}`);
    });

    console.log('\n🔍 Analyzing bookings with ground population issues...');
    
    for (const booking of bookings) {
      const groundId = booking.groundId;
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(groundId);
      
      let groundFound = false;
      let groundSource = 'none';
      let groundName = 'Unknown';
      
      // Check MongoDB
      if (isValidObjectId) {
        const mongoGround = await Ground.findById(groundId);
        if (mongoGround) {
          groundFound = true;
          groundSource = 'MongoDB';
          groundName = mongoGround.name;
        }
      }
      
      // Check fallback
      if (!groundFound) {
        const fallbackGround = fallbackGrounds.find(g => g._id === groundId);
        if (fallbackGround) {
          groundFound = true;
          groundSource = 'Fallback';
          groundName = fallbackGround.name;
        }
      }
      
      console.log(`📋 Booking ${booking.bookingId}:`);
      console.log(`   Ground ID: ${groundId} (${isValidObjectId ? 'Valid ObjectId' : 'String ID'})`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Ground Found: ${groundFound ? 'YES' : 'NO'} (${groundSource})`);
      console.log(`   Ground Name: ${groundName}`);
      console.log(`   Date: ${booking.bookingDate.toDateString()}`);
      console.log('   ---');
    }

    // Check for specific patterns
    console.log('\n🔍 Analyzing groundId patterns...');
    const groundIds = [...new Set(bookings.map(b => b.groundId))];
    const missingGrounds = [];
    
    for (const groundId of groundIds) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(groundId);
      let found = false;
      
      if (isValidObjectId) {
        const mongoGround = await Ground.findById(groundId);
        if (mongoGround) found = true;
      }
      
      if (!found) {
        const fallbackGround = fallbackGrounds.find(g => g._id === groundId);
        if (fallbackGround) found = true;
      }
      
      if (!found) {
        missingGrounds.push(groundId);
      }
    }
    
    console.log(`\n❌ Ground IDs that cannot be found (${missingGrounds.length}):`);
    missingGrounds.forEach(id => {
      console.log(`   - ${id} (${/^[0-9a-fA-F]{24}$/.test(id) ? 'ObjectId' : 'String'})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugGroundUnavailable();
