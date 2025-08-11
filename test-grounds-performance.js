// Test script to verify grounds loading performance improvements
require('dotenv').config();
const mongoose = require('mongoose');
const { performance } = require('perf_hooks');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define Ground schema (simplified version)
const groundSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: {
    address: String,
    cityId: String,
    cityName: String,
    state: String,
    latitude: Number,
    longitude: Number,
    pincode: String,
  },
  price: {
    ranges: [
      {
        start: String,
        end: String,
        perHour: Number,
      },
    ],
    currency: String,
    discount: Number,
  },
  images: [
    {
      url: String,
      alt: String,
      isPrimary: Boolean,
    },
  ],
  amenities: [String],
  features: {
    pitchType: String,
    capacity: Number,
    lighting: Boolean,
    parking: Boolean,
    changeRoom: Boolean,
    washroom: Boolean,
    cafeteria: Boolean,
    equipment: Boolean,
  },
  owner: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: String,
    contact: String,
    email: String,
    verified: Boolean,
  },
  rating: {
    average: Number,
    count: Number,
    reviews: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        rating: Number,
        comment: String,
        createdAt: Date,
      },
    ],
  },
  status: String,
  totalBookings: Number,
});

const Ground = mongoose.model('Ground', groundSchema);

// Test functions
const testRegularQuery = async () => {
  console.log('\n===== TESTING REGULAR QUERY =====');
  const start = performance.now();
  
  const grounds = await Ground.find({})
    .populate('owner.userId', 'name email phone')
    .sort({ 'rating.average': -1, totalBookings: -1 })
    .skip(0)
    .limit(10);
  
  const end = performance.now();
  console.log(`Found ${grounds.length} grounds`);
  console.log(`Regular query took ${(end - start).toFixed(2)}ms`);
  return end - start;
};

const testOptimizedQuery = async () => {
  console.log('\n===== TESTING OPTIMIZED QUERY =====');
  const start = performance.now();
  
  const grounds = await Ground.find({})
    .populate('owner.userId', 'name email phone')
    .sort({ 'rating.average': -1, totalBookings: -1 })
    .skip(0)
    .limit(10)
    .lean()
    .maxTimeMS(5000);
  
  const end = performance.now();
  console.log(`Found ${grounds.length} grounds`);
  console.log(`Optimized query took ${(end - start).toFixed(2)}ms`);
  return end - start;
};

// Run tests
const runTests = async () => {
  await connectDB();
  
  try {
    // Run each test multiple times to get average performance
    const iterations = 5;
    let regularTimes = [];
    let optimizedTimes = [];
    
    console.log(`Running ${iterations} iterations of each test...`);
    
    for (let i = 0; i < iterations; i++) {
      console.log(`\n----- Iteration ${i + 1}/${iterations} -----`);
      regularTimes.push(await testRegularQuery());
      optimizedTimes.push(await testOptimizedQuery());
    }
    
    // Calculate averages
    const regularAvg = regularTimes.reduce((a, b) => a + b, 0) / regularTimes.length;
    const optimizedAvg = optimizedTimes.reduce((a, b) => a + b, 0) / optimizedTimes.length;
    
    // Print results
    console.log('\n===== PERFORMANCE TEST RESULTS =====');
    console.log(`Regular query average: ${regularAvg.toFixed(2)}ms`);
    console.log(`Optimized query average: ${optimizedAvg.toFixed(2)}ms`);
    console.log(`Performance improvement: ${((regularAvg - optimizedAvg) / regularAvg * 100).toFixed(2)}%`);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the tests
runTests().catch(console.error);