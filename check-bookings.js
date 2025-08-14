import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simple booking schema for checking
const bookingSchema = new mongoose.Schema({
  bookingId: String,
  status: String,
  payment: {
    status: String,
    cashfreeOrderId: String,
    paidAt: Date
  },
  confirmation: {
    confirmedAt: Date,
    confirmationCode: String,
    confirmedBy: String
  }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

async function checkBookings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('bookingId status payment confirmation createdAt');

    console.log('\n📋 Recent Bookings:');
    recentBookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Booking ${booking.bookingId}:`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Payment Status: ${booking.payment?.status || 'None'}`);
      console.log(`   Cashfree Order: ${booking.payment?.cashfreeOrderId || 'None'}`);
      console.log(`   Paid At: ${booking.payment?.paidAt || 'None'}`);
      console.log(`   Confirmed: ${booking.confirmation?.confirmedAt ? 'Yes' : 'No'}`);
      console.log(`   Confirmation Code: ${booking.confirmation?.confirmationCode || 'None'}`);
      console.log(`   Created: ${booking.createdAt}`);
    });

    // Find pending bookings with payment details
    const pendingWithPayment = await Booking.find({
      status: 'pending',
      'payment.cashfreeOrderId': { $exists: true }
    }).sort({ createdAt: -1 });

    if (pendingWithPayment.length > 0) {
      console.log('\n⚠️  Pending bookings with payment details (potential issues):');
      pendingWithPayment.forEach((booking, index) => {
        console.log(`\n${index + 1}. Booking ${booking.bookingId}:`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Payment Status: ${booking.payment?.status}`);
        console.log(`   Cashfree Order: ${booking.payment?.cashfreeOrderId}`);
        console.log(`   Created: ${booking.createdAt}`);
      });
    } else {
      console.log('\n✅ No pending bookings with payment details found');
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBookings();
