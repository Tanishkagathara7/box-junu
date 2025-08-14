import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import the actual Booking model
import Booking from './server/models/Booking.js';

async function fixPaymentStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find bookings that are confirmed but have pending payment status
    const bookingsToFix = await Booking.find({
      status: 'confirmed',
      'payment.status': 'pending'
    });

    console.log(`\n🔧 Found ${bookingsToFix.length} bookings to fix`);

    for (const booking of bookingsToFix) {
      console.log(`\nFixing booking ${booking.bookingId}:`);
      console.log(`  Current status: ${booking.status}`);
      console.log(`  Current payment status: ${booking.payment?.status}`);
      
      // Update payment status to completed and set paidAt
      booking.payment.status = 'completed';
      if (!booking.payment.paidAt) {
        booking.payment.paidAt = booking.confirmation?.confirmedAt || new Date();
      }
      
      await booking.save();
      console.log(`  ✅ Fixed! Payment status: ${booking.payment.status}, Paid at: ${booking.payment.paidAt}`);
    }

    // Also find old pending bookings with completed payment status
    const oldPendingBookings = await Booking.find({
      status: 'pending',
      'payment.status': 'completed'
    });

    console.log(`\n🔧 Found ${oldPendingBookings.length} old pending bookings with completed payments`);

    for (const booking of oldPendingBookings) {
      console.log(`\nFixing old booking ${booking.bookingId}:`);
      console.log(`  Current status: ${booking.status}`);
      console.log(`  Payment status: ${booking.payment?.status}`);
      
      // Update booking status to confirmed and add confirmation details
      booking.status = 'confirmed';
      if (!booking.confirmation) {
        booking.confirmation = {
          confirmedAt: booking.payment.paidAt || new Date(),
          confirmationCode: `BC${Date.now().toString().slice(-6)}`,
          confirmedBy: "manual_fix"
        };
      }
      
      await booking.save();
      console.log(`  ✅ Fixed! Status: ${booking.status}, Confirmation: ${booking.confirmation?.confirmationCode}`);
    }

    console.log('\n✅ All bookings fixed!');

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixPaymentStatus();
