#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing Netlify deployment issues...');

// Step 1: Clean and rebuild
console.log('\n1. Cleaning and rebuilding...');
try {
  if (fs.existsSync('dist')) {
    // Use Windows-compatible command
    execSync('rmdir /s /q dist', { stdio: 'inherit' });
  }
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Create _redirects file
console.log('\n2. Creating _redirects file...');
const redirectsContent = `/api/*  https://boxcric-api.onrender.com/api/:splat  200!
/*    /index.html   200`;
fs.writeFileSync(path.join('dist', '_redirects'), redirectsContent);
console.log('✅ _redirects file created');

// Step 3: Create _headers file
console.log('\n3. Creating _headers file...');
const headersContent = `/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable`;
fs.writeFileSync(path.join('dist', '_headers'), headersContent);
console.log('✅ _headers file created');

// Step 4: Verify index.html
console.log('\n4. Verifying index.html...');
const indexHtmlPath = path.join('dist', 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Check if jsxDEV fix is present
if (!indexHtml.includes('window.jsxDEV')) {
  indexHtml = indexHtml.replace(
    '<script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>',
    '<script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>\n    <!-- Fix for jsxDEV not a function error -->\n    <script>\n      window.jsxDEV = function() { return null; };\n    </script>'
  );
  fs.writeFileSync(indexHtmlPath, indexHtml);
  console.log('✅ Added jsxDEV fix to index.html');
} else {
  console.log('✅ jsxDEV fix already present');
}

// Step 5: Verify assets
console.log('\n5. Verifying assets...');
const assetsPath = path.join('dist', 'assets');
if (fs.existsSync(assetsPath)) {
  const assetsContents = fs.readdirSync(assetsPath);
  console.log('📁 Assets found:', assetsContents);
  
  if (assetsContents.length === 0) {
    console.error('❌ Assets folder is empty');
    process.exit(1);
  }
} else {
  console.error('❌ Assets folder not found');
  process.exit(1);
}

// Step 6: Create environment configuration
console.log('\n6. Creating environment configuration...');
const envConfig = `// Environment configuration for production
window.BOXCRIC_CONFIG = {
  API_URL: 'https://boxcric-api.onrender.com/api',
  ENVIRONMENT: 'production',
  VERSION: '1.0.0'
};`;

fs.writeFileSync(path.join('dist', 'env-config.js'), envConfig);
console.log('✅ Environment configuration created');

// Step 7: Update index.html to include environment config
console.log('\n7. Updating index.html with environment config...');
indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
if (!indexHtml.includes('env-config.js')) {
  indexHtml = indexHtml.replace(
    '<script>\n      window.jsxDEV = function() { return null; };\n    </script>',
    '<script>\n      window.jsxDEV = function() { return null; };\n    </script>\n    <script src="/env-config.js"></script>'
  );
  fs.writeFileSync(indexHtmlPath, indexHtml);
  console.log('✅ Added environment config to index.html');
} else {
  console.log('✅ Environment config already present');
}

console.log('\n🎉 Netlify deployment fix completed!');
console.log('\n📋 Next steps:');
console.log('1. Commit and push these changes to your repository');
console.log('2. In Netlify dashboard, trigger a new deployment');
console.log('3. Set environment variable: VITE_API_URL=https://boxcric-api.onrender.com/api');
console.log('4. Clear Netlify cache if needed');
console.log('\n🔗 Your site should work at: https://boxcric.netlify.app'); 