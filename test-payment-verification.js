import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Cashfree } from 'cashfree-pg-sdk-nodejs';

// Load environment variables
dotenv.config();

// Import models
import Booking from './server/models/Booking.js';

// Initialize Cashfree
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const USE_SANDBOX = process.env.CASHFREE_MODE === 'test';

const cashfree = new Cashfree(
  CASHFREE_APP_ID,
  CASHFREE_SECRET_KEY,
  USE_SANDBOX ? "sandbox" : "production"
);

async function testPaymentVerification() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the most recent booking with payment details
    const booking = await Booking.findOne({
      'payment.cashfreeOrderId': { $exists: true }
    }).sort({ createdAt: -1 });

    if (!booking) {
      console.log('❌ No booking with payment details found');
      return;
    }

    console.log('\n📋 Testing booking:');
    console.log('Booking ID:', booking.bookingId);
    console.log('Status:', booking.status);
    console.log('Payment Status:', booking.payment?.status);
    console.log('Cashfree Order ID:', booking.payment?.cashfreeOrderId);

    if (!booking.payment?.cashfreeOrderId) {
      console.log('❌ No Cashfree order ID found');
      return;
    }

    // Try to verify payment with Cashfree
    console.log('\n🔍 Verifying payment with Cashfree...');
    try {
      const response = await cashfree.PGFetchOrder(booking.payment.cashfreeOrderId);
      const paymentDetails = response.data;
      
      console.log('✅ Payment verification successful!');
      console.log('Order Status:', paymentDetails.order_status);
      console.log('Order Amount:', paymentDetails.order_amount);
      console.log('Payment Details:', JSON.stringify(paymentDetails, null, 2));

      // If payment is successful but booking is still pending, update it
      if (paymentDetails.order_status === 'PAID' && booking.status === 'pending') {
        console.log('\n🔧 Payment is PAID but booking is still pending. Updating...');
        
        booking.payment.status = "completed";
        booking.payment.paidAt = new Date();
        booking.payment.paymentDetails = paymentDetails;
        booking.status = "confirmed";
        booking.confirmation = {
          confirmedAt: new Date(),
          confirmationCode: `BC${Date.now().toString().slice(-6)}`,
          confirmedBy: "manual_fix"
        };

        await booking.save();
        console.log('✅ Booking updated successfully!');
        console.log('New Status:', booking.status);
        console.log('Confirmation Code:', booking.confirmation.confirmationCode);
      } else {
        console.log('ℹ️  Booking status is already correct or payment not completed');
      }

    } catch (cashfreeError) {
      console.error('❌ Cashfree verification failed:', cashfreeError.response?.data || cashfreeError.message);
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPaymentVerification();
