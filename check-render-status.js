// Script to check Render deployment status
import fetch from 'node-fetch';

async function checkRenderDeployment() {
  console.log('🔍 Checking Render Deployment Status\n');
  
  const renderUrl = 'https://box-host-1.onrender.com'; // Update this with your actual Render URL
  const githubRepo = 'https://github.com/Tanishkagathara7/box-junu';
  
  console.log(`📡 Testing Render service: ${renderUrl}`);
  console.log(`📂 GitHub repository: ${githubRepo}\n`);
  
  // Test 1: Basic connectivity
  console.log('1. 🌐 Testing basic connectivity...');
  try {
    const response = await fetch(renderUrl, { timeout: 10000 });
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Service is responding');
      console.log(`📊 Response: ${data.message}`);
      console.log(`🏷️  Version: ${data.version}`);
      console.log(`📅 Timestamp: ${data.timestamp}`);
    } else {
      console.log(`❌ Service returned status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    console.log('💡 This might indicate:');
    console.log('   - Service is still building/deploying');
    console.log('   - Service is sleeping (free tier)');
    console.log('   - Deployment failed');
  }
  
  // Test 2: Health check endpoint
  console.log('\n2. 🏥 Testing health check endpoint...');
  try {
    const healthResponse = await fetch(`${renderUrl}/api/health`, { timeout: 10000 });
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed');
      console.log(`📊 Status: ${healthData.status}`);
      console.log(`🗄️  Database: ${healthData.services?.database?.status}`);
      console.log(`📧 Email: ${healthData.services?.email?.status}`);
      console.log(`💳 Payments: ${healthData.services?.payments?.status}`);
    } else {
      console.log(`❌ Health check failed with status: ${healthResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
  }
  
  // Test 3: API endpoint
  console.log('\n3. 🛠️  Testing API endpoint...');
  try {
    const apiResponse = await fetch(`${renderUrl}/api`, { timeout: 10000 });
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('✅ API endpoint working');
      console.log(`📋 Available endpoints: ${apiData.endpoints?.length || 0}`);
    } else {
      console.log(`❌ API endpoint failed with status: ${apiResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ API endpoint error: ${error.message}`);
  }
  
  console.log('\n📋 Auto-Deploy Troubleshooting Checklist:');
  console.log('');
  console.log('In your Render Dashboard (https://dashboard.render.com):');
  console.log('1. ✅ Go to your service (box-host-1)');
  console.log('2. ✅ Check Settings → Build & Deploy');
  console.log('3. ✅ Ensure "Auto-Deploy" is set to "Yes"');
  console.log('4. ✅ Verify branch is set to "main"');
  console.log('5. ✅ Check that GitHub repository is connected');
  console.log('6. ✅ Review Environment variables are all set');
  console.log('');
  console.log('Recent Git pushes:');
  console.log('✅ Email fixes pushed');
  console.log('✅ Render configuration fixes pushed');
  console.log('');
  console.log('If auto-deploy still isn\'t working:');
  console.log('1. 🔄 Try Manual Deploy in Render dashboard');
  console.log('2. 📋 Check deployment logs for errors');
  console.log('3. 🔗 Verify GitHub webhook is active');
  console.log('4. 💬 Contact Render support if issues persist');
  console.log('');
  console.log('Expected behavior:');
  console.log('- Push to GitHub → Render detects change');
  console.log('- Render starts build process automatically');
  console.log('- Service deploys with new changes');
  console.log('- Service becomes available at your Render URL');
}

// Run the check
checkRenderDeployment().catch(console.error);