import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import Booking from './server/models/Booking.js';

async function debugPaymentIssue() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the most recent booking
    const recentBooking = await Booking.findOne()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('groundId', 'name');

    if (!recentBooking) {
      console.log('❌ No bookings found');
      return;
    }

    console.log('\n📋 Most Recent Booking:');
    console.log('Booking ID:', recentBooking.bookingId);
    console.log('MongoDB ID:', recentBooking._id);
    console.log('Status:', recentBooking.status);
    console.log('Created:', recentBooking.createdAt);
    console.log('User:', recentBooking.userId?.name || 'Unknown');
    console.log('Ground:', recentBooking.groundId?.name || 'Unknown');

    console.log('\n💳 Payment Details:');
    if (recentBooking.payment) {
      console.log('Payment Status:', recentBooking.payment.status);
      console.log('Cashfree Order ID:', recentBooking.payment.cashfreeOrderId);
      console.log('Payment Session ID:', recentBooking.payment.cashfreePaymentSessionId);
      console.log('Paid At:', recentBooking.payment.paidAt);
      console.log('Payment Details:', recentBooking.payment.paymentDetails ? 'Present' : 'None');
    } else {
      console.log('No payment details found');
    }

    console.log('\n✅ Confirmation Details:');
    if (recentBooking.confirmation) {
      console.log('Confirmed At:', recentBooking.confirmation.confirmedAt);
      console.log('Confirmation Code:', recentBooking.confirmation.confirmationCode);
      console.log('Confirmed By:', recentBooking.confirmation.confirmedBy);
    } else {
      console.log('No confirmation details found');
    }

    // Check if there are any pending bookings with payment details
    const pendingWithPayment = await Booking.find({
      status: 'pending',
      'payment.cashfreeOrderId': { $exists: true }
    }).sort({ createdAt: -1 }).limit(5);

    if (pendingWithPayment.length > 0) {
      console.log('\n⚠️  Found pending bookings with payment details:');
      pendingWithPayment.forEach((booking, index) => {
        console.log(`${index + 1}. Booking ${booking.bookingId}:`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Payment Status: ${booking.payment?.status}`);
        console.log(`   Cashfree Order: ${booking.payment?.cashfreeOrderId}`);
        console.log(`   Created: ${booking.createdAt}`);
      });
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugPaymentIssue();
