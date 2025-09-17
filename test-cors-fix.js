// CORS Fix Test Script
// Run this in browser console on https://box-junu.vercel.app

console.log("🧪 Testing CORS Fix...");

async function testCORS() {
  const baseUrl = 'https://box-junu.onrender.com/api';
  
  console.log("🔍 Testing API endpoints from:", window.location.origin);
  
  try {
    // Test 1: Basic CORS test endpoint
    console.log("1️⃣ Testing CORS test endpoint...");
    const corsTest = await fetch(`${baseUrl}/cors-test`);
    const corsData = await corsTest.json();
    console.log("✅ CORS test endpoint response:", corsData);
    
    // Test 2: Server health check
    console.log("2️⃣ Testing server health...");
    const healthTest = await fetch(`${baseUrl}/test`);
    const healthData = await healthTest.json();
    console.log("✅ Server health response:", healthData);
    
    // Test 3: Grounds API (the one that was failing)
    console.log("3️⃣ Testing grounds API...");
    const groundsTest = await fetch(`${baseUrl}/grounds?cityId=rajkot&page=1&limit=5`);
    const groundsData = await groundsTest.json();
    console.log("✅ Grounds API response:", groundsData);
    
    // Test 4: Notifications API (if authenticated)
    console.log("4️⃣ Testing notifications API...");
    const token = localStorage.getItem('boxcric_token');
    if (token) {
      const notificationsTest = await fetch(`${baseUrl}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const notificationsData = await notificationsTest.json();
      console.log("✅ Notifications API response:", notificationsData);
    } else {
      console.log("⚠️ No auth token found, skipping notifications test");
    }
    
    console.log("🎉 All CORS tests passed! The fix is working.");
    
  } catch (error) {
    console.error("❌ CORS test failed:", error);
    
    if (error.message.includes('CORS')) {
      console.log("💡 CORS issue detected. Check:");
      console.log("- Is FRONTEND_URL set correctly on Render?");
      console.log("- Is the server deployed with the latest changes?");
      console.log("- Check Render server logs for CORS debug messages");
    }
  }
}

// Run the test
testCORS();

// Also test the mobile search visibility
console.log("📱 Checking mobile search visibility...");
const mobileSearchArea = document.querySelector('.lg\\:hidden');
console.log("Mobile search container found:", !!mobileSearchArea);

if (mobileSearchArea) {
  const searchInput = mobileSearchArea.querySelector('input[placeholder*="Search"]');
  console.log("Mobile search input found:", !!searchInput);
  
  const notificationArea = mobileSearchArea.querySelector('.flex-shrink-0');
  console.log("Mobile notification area found:", !!notificationArea);
}

// Check auth state
const token = localStorage.getItem('boxcric_token');
const userData = localStorage.getItem('boxcric_user');
console.log("Auth state:");
console.log("- Token exists:", !!token);
console.log("- User data exists:", !!userData);

console.log("🏁 Test complete!");