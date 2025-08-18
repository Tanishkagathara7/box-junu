import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Testing BoxCric Email Configuration...\n');

// Check all email environment variables
console.log('📧 Email Configuration:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('');

if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('❌ Email configuration incomplete!');
  console.log('Please check your .env file and ensure all email variables are set.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

try {
  console.log('🔍 Verifying email transporter...');
  await transporter.verify();
  console.log('✅ Email configuration is working!');
  
  // Test sending a simple email
  console.log('\n📧 Sending test email...');
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to self for testing
    subject: 'BoxCric - Email Configuration Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">✅ Email Configuration Test Successful!</h2>
        <p>This is a test email to verify that BoxCric's email configuration is working properly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>From:</strong> ${process.env.EMAIL_FROM || process.env.EMAIL_USER}</p>
        <hr>
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated test email from BoxCric. If you received this, your email configuration is working correctly.
        </p>
      </div>
    `,
  });
  
  console.log('✅ Test email sent successfully!');
  console.log('Message ID:', info.messageId);
  
} catch (error) {
  console.log('❌ Email configuration failed:', error.message);
  console.log('\n🔧 Troubleshooting tips:');
  console.log('1. Check if your Gmail app password is correct');
  console.log('2. Ensure 2-factor authentication is enabled on Gmail');
  console.log('3. Verify the app password is 16 characters without spaces');
  console.log('4. Check if "Less secure app access" is disabled (should be)');
}
