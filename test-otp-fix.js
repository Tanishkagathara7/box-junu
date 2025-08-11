// Test script to verify OTP functionality
const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration test
console.log('\n===== EMAIL CONFIGURATION TEST =====');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

// Create transporter
const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️  Email configuration not found. Using development mode - OTPs will be logged to console.");
    return null;
  }

  try {
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add timeout to prevent hanging connections
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    
    console.log('✅ Transporter created successfully');
    return transport;
  } catch (error) {
    console.error("❌ Failed to create email transport:", error);
    return null;
  }
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send test email
const sendTestEmail = async () => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('❌ Transporter not available');
    return;
  }
  
  // Verify connection
  try {
    console.log('\n===== VERIFYING EMAIL CONNECTION =====');
    const verification = await transporter.verify();
    console.log('✅ Email connection verified:', verification);
  } catch (error) {
    console.error('❌ Email verification failed:', error);
    return;
  }
  
  // Send test email
  try {
    console.log('\n===== SENDING TEST EMAIL =====');
    const testEmail = process.env.EMAIL_USER; // Send to self for testing
    const otp = generateOTP();
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: testEmail,
      subject: 'BoxCric - Test OTP Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test OTP Email</h2>
          <p>This is a test email to verify OTP functionality.</p>
          <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #22c55e; letter-spacing: 5px;">${otp}</div>
          </div>
          <p>If you received this email, the OTP functionality is working correctly.</p>
        </div>
      `,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
  }
};

// Run the test
sendTestEmail().catch(console.error);