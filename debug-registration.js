import axios from 'axios';

const testRegistration = async () => {
  try {
    const response = await axios.post('https://box-new.onrender.com/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'testpass123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
  }
};

testRegistration();
