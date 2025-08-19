// Complete fix for PDF and email receipt issues
import express from 'express';
import cors from 'cors';

const app = express();

// Add CORS middleware to allow frontend requests
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://box-junu.vercel.app'],
  credentials: true
}));

// Test endpoint without authentication for debugging
app.get('/test-receipt/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Import required modules
    const { default: Booking } = await import('./server/models/Booking.js');
    const { default: User } = await import('./server/models/User.js');
    const { default: Ground } = await import('./server/models/Ground.js');
    const { generateBookingReceiptHTML } = await import('./server/templates/bookingReceiptTemplate.js');
    const { fallbackGrounds } = await import('./server/data/fallbackGrounds.js');
    
    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Get user
    const user = await User.findById(booking.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Process booking data
    let bookingObj = booking.toObject();
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bookingObj.groundId);
    
    if (isValidObjectId) {
      try {
        const mongoGround = await Ground.findById(bookingObj.groundId);
        if (mongoGround) {
          bookingObj.groundId = mongoGround.toObject();
        } else {
          const fallbackGround = fallbackGrounds.find(g => g._id === bookingObj.groundId);
          if (fallbackGround) {
            bookingObj.groundId = fallbackGround;
          }
        }
      } catch (error) {
        console.error('Ground lookup error:', error);
      }
    }
    
    // Ensure all required fields exist
    if (!bookingObj.pricing) {
      bookingObj.pricing = { baseAmount: 0, discount: 0, taxes: 0, totalAmount: 0 };
    }
    if (!bookingObj.timeSlot) {
      bookingObj.timeSlot = { startTime: 'N/A', endTime: 'N/A', duration: 'N/A' };
    }
    if (!bookingObj.playerDetails) {
      bookingObj.playerDetails = { 
        teamName: 'N/A', 
        playerCount: 'N/A',
        contactPerson: { name: 'N/A', phone: 'N/A' }
      };
    }
    
    // Generate HTML
    const html = generateBookingReceiptHTML(bookingObj, user);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
    
  } catch (error) {
    console.error('Test receipt error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3003, () => {
  console.log('🧪 Test server running on http://localhost:3003');
  console.log('📄 Test receipt: http://localhost:3003/test-receipt/68a30109ff18c2ec94c09831');
});

export default app;
