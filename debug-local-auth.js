// Debug script for localhost authentication issues
// Run this in browser console on http://localhost:5173

console.log("🔍 Debugging localhost authentication state...");

// Check localStorage
const token = localStorage.getItem("boxcric_token");
const userData = localStorage.getItem("boxcric_user");

console.log("📦 LocalStorage Check:");
console.log("- Token exists:", !!token);
console.log("- Token value:", token ? `${token.substring(0, 30)}...` : "null");
console.log("- User data exists:", !!userData);

if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log("👤 User data:", {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified
    });
  } catch (e) {
    console.error("❌ Error parsing user data:", e);
  }
} else {
  console.log("❌ No user data found in localStorage");
}

// Check if mobile search container exists
console.log("\n📱 Mobile UI Check:");
const mobileContainer = document.querySelector('.lg\\:hidden');
console.log("- Mobile container found:", !!mobileContainer);

if (mobileContainer) {
  const searchInput = mobileContainer.querySelector('input[placeholder*="Search"]');
  const notificationArea = mobileContainer.querySelector('.flex-shrink-0');
  const debugIcon = mobileContainer.querySelector('[title*="Auth:"]');
  
  console.log("- Mobile search input:", !!searchInput);
  console.log("- Notification area:", !!notificationArea);
  console.log("- Debug icon (🐛):", !!debugIcon);
  
  if (debugIcon) {
    console.log("- Debug icon title:", debugIcon.getAttribute('title'));
  }
}

// Check current screen size
const screenWidth = window.innerWidth;
console.log("- Screen width:", screenWidth);
console.log("- Should show mobile UI:", screenWidth < 1024);

// Test API connection
console.log("\n🔗 API Connection Test:");
const apiBaseUrl = "http://localhost:3001/api";

fetch(`${apiBaseUrl}/test`)
  .then(response => response.json())
  .then(data => {
    console.log("✅ API server responding:", data);
  })
  .catch(error => {
    console.error("❌ API server not responding:", error.message);
    console.log("💡 Make sure your backend server is running on port 3001");
  });

// Check if NotificationPanel component is available
console.log("\n🔔 Notification Component Check:");
setTimeout(() => {
  const notificationPanels = document.querySelectorAll('[data-testid="notification-panel"], .notification-panel');
  console.log("- NotificationPanel components found:", notificationPanels.length);
  
  if (notificationPanels.length === 0) {
    console.log("💡 If you're logged in but don't see notifications, the NotificationPanel component might have an issue");
  }
}, 1000);

console.log("\n=== Instructions ===");
console.log("1. If you see a 🐛 icon in mobile view, you're not authenticated");
console.log("2. Try logging in with a test account");
console.log("3. After login, the 🐛 should disappear and notification bell should appear");
console.log("4. Make sure your backend server is running on http://localhost:3001");