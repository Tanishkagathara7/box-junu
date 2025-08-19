import mongoose from 'mongoose';
import Ground from './server/models/Ground.js';

const fixGroundData = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/boxcric');
    console.log('📊 Connected to MongoDB');

    // Find the ground we're using
    const ground = await Ground.findById('685cef6afccee12728ec2105');
    if (!ground) {
      console.log('❌ Ground not found');
      return;
    }

    console.log('🏟️ Current ground data:');
    console.log('- Name:', ground.name);
    console.log('- Location:', ground.location);
    console.log('- Owner:', ground.owner);

    // Update the ground with proper contact and location details
    // First replace the location string with proper object
    await Ground.findByIdAndUpdate('685cef6afccee12728ec2105', {
      $set: {
        'location': {
          address: '123 Sports Complex, Rajkott',
          cityId: 'rajkot_001',
          cityName: 'Rajkot',
          state: 'Gujarat',
          latitude: 22.3039,
          longitude: 70.8022,
          pincode: '360001'
        },
        'owner.contact': '+91 9876543210',
        'owner.email': 'owner@cricketboxing.com'
      }
    });

    console.log('✅ Ground data updated with contact details');

    // Verify the update
    const updatedGround = await Ground.findById('685cef6afccee12728ec2105');
    console.log('\n🔍 Updated ground data:');
    console.log('- Name:', updatedGround.name);
    console.log('- Location:', updatedGround.location);
    console.log('- Owner contact:', updatedGround.owner?.contact);
    console.log('- Owner email:', updatedGround.owner?.email);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

fixGroundData();
