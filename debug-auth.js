// Debug authentication state in production
// Run this in the browser console on your live site

console.log("=== BoxCric Authentication Debug ===");

// Check localStorage for auth data
const token = localStorage.getItem("boxcric_token");
const userData = localStorage.getItem("boxcric_user");

console.log("Token exists:", !!token);
console.log("Token value:", token ? `${token.substring(0, 20)}...` : "null");
console.log("User data exists:", !!userData);

if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log("User object:", {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified
    });
  } catch (e) {
    console.error("Error parsing user data:", e);
  }
} else {
  console.log("User data: null");
}

// Check if the mobile search container is present
const mobileSearchArea = document.querySelector('.lg\\:hidden .relative.flex-1');
const notificationArea = document.querySelector('.lg\\:hidden .flex-shrink-0');

console.log("Mobile search area found:", !!mobileSearchArea);
console.log("Mobile search area styles:", mobileSearchArea ? getComputedStyle(mobileSearchArea).display : "not found");
console.log("Notification area found:", !!notificationArea);

// Check responsive class behavior
const lgHiddenElements = document.querySelectorAll('.lg\\:hidden');
console.log("Elements with lg:hidden class:", lgHiddenElements.length);

// Check current screen size
const screenWidth = window.innerWidth;
console.log("Current screen width:", screenWidth);
console.log("Should show mobile elements (< 1024px):", screenWidth < 1024);

// Check for CSS/Tailwind issues
const hasLgHiddenRule = Array.from(document.styleSheets).some(sheet => {
  try {
    return Array.from(sheet.cssRules).some(rule => 
      rule.cssText && rule.cssText.includes('lg:hidden')
    );
  } catch (e) {
    return false;
  }
});
console.log("Tailwind lg:hidden CSS rule found:", hasLgHiddenRule);

// Try to manually find the mobile search input
const mobileSearchInput = document.querySelector('input[placeholder*="Search grounds"]');
console.log("Mobile search input found:", !!mobileSearchInput);
if (mobileSearchInput) {
  console.log("Mobile search input visible:", getComputedStyle(mobileSearchInput).display !== 'none');
  console.log("Mobile search input container classes:", mobileSearchInput.closest('div').className);
}

console.log("=== Debug Complete ===");