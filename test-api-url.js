// Test API URL construction - Run this in browser console on your deployed site

console.log("=== API URL Test ===");

// Check environment variables
console.log("VITE_API_URL from env:", import.meta.env?.VITE_API_URL || "not set");
console.log("Is DEV environment:", import.meta.env?.DEV);

// Simulate the API URL construction logic
const VITE_API_URL = "https://box-junu.onrender.com"; // This should be set in Vercel env
const API_BASE_URL = VITE_API_URL 
  ? `${VITE_API_URL}/api`
  : (false ? "http://localhost:3001/api" : "https://box-junu.onrender.com/api");

console.log("Constructed API_BASE_URL:", API_BASE_URL);
console.log("Expected API URLs:");
console.log("- Notifications:", `${API_BASE_URL}/notifications`);
console.log("- Grounds:", `${API_BASE_URL}/grounds`);
console.log("- Bookings:", `${API_BASE_URL}/bookings/my-bookings`);

// Test if the URL is reachable
fetch(`${API_BASE_URL.replace('/api', '')}/api/test`)
  .then(response => response.json())
  .then(data => {
    console.log("✅ Server test endpoint response:", data);
  })
  .catch(error => {
    console.error("❌ Server test endpoint error:", error);
  });

console.log("=== End Test ===");