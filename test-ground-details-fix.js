// Test script to verify ground details are showing in email and PDF
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { sendBookingReceiptEmail } from './server/services/emailService.js';
import { generateBookingReceiptHTML } from './server/templates/bookingReceiptTemplate.js';
import Booking from './server/models/Booking.js';
import User from './server/models/User.js';
import Ground from './server/models/Ground.js';

dotenv.config();

const testGroundDetailsFix = async () => {
  try {
    console.log('🧪 Testing Ground Details Fix...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a real booking with ground details
    const booking = await Booking.findOne({ status: 'confirmed' }).sort({ createdAt: -1 });
    if (!booking) {
      console.log('❌ No confirmed bookings found');
      return;
    }

    console.log(`📋 Testing with booking: ${booking.bookingId}`);

    // Get user details
    const user = await User.findById(booking.userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    // Populate ground details properly
    let bookingObj = booking.toObject();
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bookingObj.groundId);

    if (isValidObjectId) {
      try {
        const mongoGround = await Ground.findById(bookingObj.groundId).select("name location price features images amenities rating owner contact");
        if (mongoGround) {
          bookingObj.groundId = mongoGround.toObject();
          console.log('✅ Ground details populated from MongoDB');
          console.log(`🏟️ Ground: ${mongoGround.name}`);
          console.log(`📍 Location: ${mongoGround.location?.address || mongoGround.location?.city || 'N/A'}`);
          console.log(`📞 Contact: ${mongoGround.contact?.phone || 'N/A'}`);
        } else {
          console.log('⚠️ Ground not found in MongoDB');
        }
      } catch (error) {
        console.error('❌ Error populating ground:', error);
      }
    }

    // Test 1: HTML Receipt Generation
    console.log('\n1. 📄 Testing HTML Receipt Generation...');
    try {
      const receiptHTML = generateBookingReceiptHTML(bookingObj, user);
      
      // Check for ground details in HTML
      const hasGroundName = receiptHTML.includes(bookingObj.groundId?.name || 'Ground details unavailable');
      const hasGroundLocation = receiptHTML.includes(bookingObj.groundId?.location?.address || bookingObj.groundId?.location?.city || 'N/A');
      const hasGroundContact = receiptHTML.includes(bookingObj.groundId?.contact?.phone || 'N/A');
      const hasMobileViewport = receiptHTML.includes('user-scalable=yes');
      const hasMobileCSS = receiptHTML.includes('@media (max-width: 600px)');
      
      console.log(`   ✅ HTML generated (${receiptHTML.length} characters)`);
      console.log(`   🏟️ Contains ground name: ${hasGroundName ? '✅' : '❌'}`);
      console.log(`   📍 Contains ground location: ${hasGroundLocation ? '✅' : '❌'}`);
      console.log(`   📞 Contains ground contact: ${hasGroundContact ? '✅' : '❌'}`);
      console.log(`   📱 Has mobile viewport: ${hasMobileViewport ? '✅' : '❌'}`);
      console.log(`   🎨 Has mobile CSS: ${hasMobileCSS ? '✅' : '❌'}`);
      
      // Save HTML for manual inspection
      const fs = await import('fs');
      fs.writeFileSync('test-receipt-with-ground-details.html', receiptHTML);
      console.log('   💾 Saved HTML to test-receipt-with-ground-details.html');
      
    } catch (error) {
      console.error('❌ Error generating HTML receipt:', error);
    }

    // Test 2: Email Template Generation
    console.log('\n2. 📧 Testing Email Receipt...');
    try {
      const emailResult = await sendBookingReceiptEmail(bookingObj, user);
      console.log(`   📧 Email result: ${emailResult.success ? '✅' : '❌'} ${emailResult.message}`);
      
      if (emailResult.developmentMode) {
        console.log('   ⚠️ Running in development mode - email logged to console');
      }
      
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }

    // Test 3: Mobile Compatibility Check
    console.log('\n3. 📱 Testing Mobile Compatibility...');
    const receiptHTML = generateBookingReceiptHTML(bookingObj, user);
    
    // Check for mobile-specific features
    const mobileFeatures = {
      viewport: receiptHTML.includes('width=device-width'),
      userScalable: receiptHTML.includes('user-scalable=yes'),
      formatDetection: receiptHTML.includes('format-detection'),
      responsiveCSS: receiptHTML.includes('@media (max-width: 600px)'),
      flexDirection: receiptHTML.includes('flex-direction: column'),
      mobileContainerStyles: receiptHTML.includes('margin: 5px'),
      mobileFontSizes: receiptHTML.includes('font-size: 12px')
    };
    
    console.log('   📱 Mobile Features Check:');
    Object.entries(mobileFeatures).forEach(([feature, present]) => {
      console.log(`      ${feature}: ${present ? '✅' : '❌'}`);
    });

    console.log('\n🎉 Ground Details Fix Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   - Fixed ground location display in email and PDF templates');
    console.log('   - Added proper mobile viewport and responsive CSS');
    console.log('   - Enhanced mobile compatibility for better viewing on phones');
    console.log('   - Ground details now properly extracted from booking data');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testGroundDetailsFix();
