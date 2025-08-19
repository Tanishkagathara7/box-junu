import mongoose from 'mongoose';
import Booking from './server/models/Booking.js';
import Ground from './server/models/Ground.js';
import User from './server/models/User.js';

const createTestData = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/boxcric');
    console.log('📊 Connected to MongoDB');

    // Create a test user first for owner reference
    const ownerUser = new User({
      name: "Zeel Shah",
      email: "zeel@zeelsground.com",
      phone: "+91 9876543210",
      password: "password123"
    });
    await ownerUser.save();

    // Create a test ground with proper location and contact details
    const testGround = new Ground({
      name: "Zeel's Cricket Ground",
      description: "Premium cricket ground with modern facilities",
      location: {
        address: "123 Sports Complex, MG Road",
        cityId: "mumbai_001",
        cityName: "Mumbai",
        state: "Maharashtra",
        latitude: 19.0760,
        longitude: 72.8777,
        pincode: "400001"
      },
      owner: {
        userId: ownerUser._id,
        name: "Zeel Shah",
        contact: "+91 9876543210",
        email: "zeel@zeelsground.com"
      },
      price: {
        ranges: [
          { start: "06:00", end: "18:00", perHour: 1200 },
          { start: "18:00", end: "23:00", perHour: 1500 }
        ],
        currency: "INR"
      },
      features: {
        pitchType: "Artificial Turf",
        capacity: 22,
        lighting: true,
        parking: true,
        changeRoom: true,
        washroom: true,
        cafeteria: true,
        equipment: false
      },
      amenities: ["Cafeteria", "First Aid", "Equipment Rental"],
      images: [
        { url: "ground1.jpg", alt: "Main ground view", isPrimary: true },
        { url: "ground2.jpg", alt: "Facilities view", isPrimary: false }
      ],
      status: "active",
      isVerified: true
    });

    await testGround.save();
    console.log('🏟️ Test ground created:', testGround._id);

    // Create a test user
    const testUser = new User({
      name: "Test User",
      email: "test@example.com",
      phone: "+91 9876543211",
      password: "password123"
    });

    await testUser.save();
    console.log('👤 Test user created:', testUser._id);

    // Create a test booking
    const testBooking = new Booking({
      bookingId: "BCMEHZWHB9XC0IG",
      userId: testUser._id,
      groundId: testGround._id,
      date: new Date('2025-08-19'),
      timeSlot: {
        startTime: "18:00",
        endTime: "21:00",
        duration: "3 hours"
      },
      pricing: {
        baseAmount: 4500,
        discount: 0,
        taxes: 810,
        totalAmount: 5310
      },
      playerDetails: {
        teamName: "Test Team",
        playerCount: 11,
        contactPerson: {
          name: "Team Captain",
          phone: "+91 9876543210"
        }
      },
      status: "CONFIRMED",
      paymentStatus: "PAID"
    });

    await testBooking.save();
    console.log('📋 Test booking created:', testBooking._id);

    console.log('\n✅ Test data created successfully!');
    console.log('🧪 Use booking ID:', testBooking._id);
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestData();
