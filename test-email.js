import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Email Configuration...');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test the connection
console.log('\nTesting SMTP connection...');
try {
  await transporter.verify();
  console.log('✅ SMTP connection successful!');
  
  // Try sending a test email
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_USER, // Send to self for testing
    subject: 'BoxCric - Email Configuration Test',
    text: 'This is a test email to verify the email configuration is working properly.',
    html: `
      <h2>BoxCric Email Test</h2>
      <p>This is a test email to verify the email configuration is working properly.</p>
      <p>Sent from: ${process.env.EMAIL_USER}</p>
      <p>Time: ${new Date().toISOString()}</p>
    `
  });
  
  console.log('✅ Test email sent successfully!');
  console.log('Message ID:', info.messageId);
  
} catch (error) {
  console.error('❌ SMTP Error:', error.message);
  
  if (error.code === 'EAUTH') {
    console.log('\n🔧 AUTHENTICATION ERROR - Possible solutions:');
    console.log('1. If 2FA is enabled on Gmail account:');
    console.log('   - Go to Google Account settings');
    console.log('   - Security → 2-Step Verification → App passwords');
    console.log('   - Generate an app password for Mail');
    console.log('   - Replace EMAIL_PASS with the generated app password');
    console.log('');
    console.log('2. If 2FA is NOT enabled:');
    console.log('   - Go to Google Account settings');
    console.log('   - Security → Less secure app access');
    console.log('   - Turn ON "Allow less secure apps"');
    console.log('');
    console.log('3. Alternative: Use OAuth2 instead of password authentication');
  }
  
  process.exit(1);
}

process.exit(0);
