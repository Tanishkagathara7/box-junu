import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 BoxCric Email Configuration Diagnostics\n');

// Check all email environment variables
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  from: process.env.EMAIL_FROM
};

console.log('📋 Current Email Configuration:');
console.log(`EMAIL_HOST: ${emailConfig.host}`);
console.log(`EMAIL_PORT: ${emailConfig.port}`);
console.log(`EMAIL_USER: ${emailConfig.user}`);
console.log(`EMAIL_PASS: ${emailConfig.pass ? 'SET (length: ' + emailConfig.pass.length + ')' : 'NOT SET'}`);
console.log(`EMAIL_FROM: ${emailConfig.from}\n`);

// Issue Detection
const issues = [];

// 1. Check if email is lowercase
if (emailConfig.user && emailConfig.user !== emailConfig.user.toLowerCase()) {
  issues.push('❌ EMAIL_USER should be lowercase for Gmail');
}

// 2. Check password length (App passwords are typically 16 chars)
if (emailConfig.pass && emailConfig.pass.length !== 16) {
  issues.push('⚠️  EMAIL_PASS might not be an App Password (should be 16 characters)');
}

// 3. Check if EMAIL_FROM matches EMAIL_USER
if (emailConfig.from && emailConfig.user) {
  const fromEmail = emailConfig.from.match(/<(.+)>/);
  const extractedEmail = fromEmail ? fromEmail[1] : emailConfig.from;
  if (extractedEmail.toLowerCase() !== emailConfig.user.toLowerCase()) {
    issues.push('⚠️  EMAIL_FROM and EMAIL_USER don\'t match');
  }
}

if (issues.length > 0) {
  console.log('🚨 Detected Issues:');
  issues.forEach(issue => console.log(`   ${issue}`));
  console.log('');
}

// Test different SMTP configurations
const testConfigs = [
  {
    name: 'Standard Gmail SMTP (TLS)',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailConfig.user?.toLowerCase(),
        pass: emailConfig.pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Gmail SMTP (SSL)',
    config: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailConfig.user?.toLowerCase(),
        pass: emailConfig.pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  }
];

async function testConfiguration(testConfig) {
  console.log(`🧪 Testing: ${testConfig.name}`);
  
  try {
    const transporter = nodemailer.createTransport(testConfig.config);
    
    // Test connection
    await transporter.verify();
    console.log(`✅ ${testConfig.name} - Connection successful!`);
    
    // Try sending a test email
    const info = await transporter.sendMail({
      from: emailConfig.from,
      to: emailConfig.user?.toLowerCase(),
      subject: 'BoxCric - Email Config Test',
      text: 'This is a test email to verify email configuration.',
      html: `
        <h2>✅ Email Configuration Test Successful</h2>
        <p>This confirms that your email configuration is working properly.</p>
        <p><strong>Configuration:</strong> ${testConfig.name}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `
    });
    
    console.log(`✅ ${testConfig.name} - Test email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   📧 Check your inbox at ${emailConfig.user}\n`);
    
    return { success: true, config: testConfig };
    
  } catch (error) {
    console.log(`❌ ${testConfig.name} - Failed: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.log('   🔐 Authentication Error - Check your Gmail settings:');
      console.log('      1. Ensure 2FA is enabled on Gmail account');
      console.log('      2. Generate App Password: Security → App passwords');
      console.log('      3. Use the 16-character app password in EMAIL_PASS');
    }
    
    console.log('');
    return { success: false, error: error.message };
  }
}

// Run tests
console.log('🚀 Starting SMTP Configuration Tests...\n');

let successfulConfig = null;

for (const testConfig of testConfigs) {
  const result = await testConfiguration(testConfig);
  if (result.success) {
    successfulConfig = result.config;
    break;
  }
}

if (successfulConfig) {
  console.log('🎉 SUCCESS! Working configuration found.');
  console.log('📝 Recommended .env settings:');
  console.log(`EMAIL_HOST=smtp.gmail.com`);
  console.log(`EMAIL_PORT=${successfulConfig.config.port}`);
  console.log(`EMAIL_USER=${emailConfig.user?.toLowerCase()}`);
  console.log(`EMAIL_PASS=${emailConfig.pass}`);
  console.log(`EMAIL_FROM=BoxCric <${emailConfig.user?.toLowerCase()}>`);
} else {
  console.log('💥 All configurations failed. Please check:');
  console.log('1. Gmail account credentials are correct');
  console.log('2. 2FA is enabled on Gmail account');
  console.log('3. App Password is generated and correctly set in EMAIL_PASS');
  console.log('4. Account is not locked or restricted');
  console.log('\n🔗 Gmail App Password Guide:');
  console.log('   https://support.google.com/accounts/answer/185833');
}

process.exit(0);
