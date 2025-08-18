// Test email template for syntax errors
import { generateBookingReceiptHTML } from './server/templates/bookingReceiptTemplate.js';

// Test data
const testBooking = {
  bookingId: 'TEST123',
  bookingDate: new Date(),
  status: 'confirmed',
  groundId: {
    name: 'Test Ground',
    location: 'Test Location',
    address: 'Test Address'
  },
  timeSlot: {
    startTime: '10:00',
    endTime: '11:00'
  },
  playerDetails: {
    contactPerson: {
      name: 'Test User',
      phone: '1234567890'
    },
    teamName: 'Test Team',
    numberOfPlayers: 10
  },
  pricing: {
    baseAmount: 1000,
    discount: 100,
    taxes: 50,
    totalAmount: 950
  }
};

const testUser = {
  name: 'Test User',
  email: 'test@example.com'
};

console.log('Testing email template generation...');

try {
  const htmlContent = generateBookingReceiptHTML(testBooking, testUser);
  console.log('✅ Email template generated successfully!');
  console.log('Template length:', htmlContent.length);
  
  // Check for common syntax issues
  if (htmlContent.includes('${')) {
    console.log('⚠️ Warning: Template contains unresolved template literals');
  }
  
  if (htmlContent.includes('undefined')) {
    console.log('⚠️ Warning: Template contains undefined values');
  }
  
} catch (error) {
  console.error('❌ Error generating email template:', error);
  console.error('Error details:', error.message);
  console.error('Stack trace:', error.stack);
}
