// Test receipt generation directly with database connection
import mongoose from 'mongoose';
import Booking from './server/models/Booking.js';
import Ground from './server/models/Ground.js';
import User from './server/models/User.js';
import { generateBookingReceiptHTML } from './server/templates/bookingReceiptTemplate.js';

const testReceiptDirect = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/boxcric');
    console.log('📊 Connected to MongoDB');

    const bookingId = '68a47d1f37c20f4188b5d8ef';
    
    // Get booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.log('❌ Booking not found');
      return;
    }

    // Get user
    const user = await User.findById(booking.userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    // Get ground
    const ground = await Ground.findById(booking.groundId);
    if (!ground) {
      console.log('❌ Ground not found');
      return;
    }

    console.log('✅ All data found:');
    console.log('- Booking:', booking.bookingId);
    console.log('- User:', user.name);
    console.log('- Ground:', ground.name);
    console.log('- Ground location:', ground.location);
    console.log('- Ground owner contact:', ground.owner?.contact);

    // Prepare booking object
    let bookingObj = booking.toObject();
    bookingObj.groundId = ground.toObject();

    // Generate receipt HTML
    const receiptHTML = generateBookingReceiptHTML(bookingObj, user);
    
    console.log('\n📄 Receipt HTML generated:');
    console.log('- Length:', receiptHTML.length);
    console.log('- Contains ground name:', receiptHTML.includes(ground.name));
    console.log('- Contains location:', receiptHTML.includes(ground.location.address));
    console.log('- Contains contact:', receiptHTML.includes(ground.owner.contact));

    // Save to file
    const fs = await import('fs');
    fs.writeFileSync('test-receipt-direct.html', receiptHTML);
    console.log('💾 Receipt saved to test-receipt-direct.html');

    // Check specific venue details in HTML
    const venueSection = receiptHTML.match(/<div class="section">[\s\S]*?Venue Details[\s\S]*?<\/div>/);
    if (venueSection) {
      console.log('\n🏟️ Venue section found in HTML');
      console.log('Contains "Contact not available":', venueSection[0].includes('Contact not available'));
      console.log('Contains "N/A":', venueSection[0].includes('N/A'));
      console.log('Contains actual contact:', venueSection[0].includes('+91'));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testReceiptDirect();
