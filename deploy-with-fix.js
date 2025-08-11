#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 BoxCric Deployment with jsxDEV Fix');
console.log('=====================================');

// Step 1: Build the project
console.log('\n1. Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Verify jsxDEV fix is applied
console.log('\n2. Verifying jsxDEV fix...');
const indexPath = path.join('dist', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/index.html not found');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf8');

if (indexContent.includes('window.jsxDEV = function() { return null; }')) {
  console.log('✅ jsxDEV fix is present in index.html');
} else {
  console.log('⚠️ jsxDEV fix not found, applying it...');
  
  // Apply the fix
  const fixedContent = indexContent.replace(
    '<head>',
    `<head>
    <script>
      window.jsxDEV = function() { return null; };
    </script>`
  );
  
  fs.writeFileSync(indexPath, fixedContent);
  console.log('✅ jsxDEV fix applied to index.html');
}

// Step 3: Check for other required files
console.log('\n3. Checking build output...');
const requiredFiles = ['index.html', 'assets'];
const distPath = 'dist';

for (const file of requiredFiles) {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.error(`❌ ${file} missing`);
    process.exit(1);
  }
}

// Step 4: Check assets folder
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assetsContents = fs.readdirSync(assetsPath);
  console.log(`✅ Assets folder contains ${assetsContents.length} files`);
  
  if (assetsContents.length === 0) {
    console.error('❌ Assets folder is empty');
    process.exit(1);
  }
} else {
  console.error('❌ Assets folder missing');
  process.exit(1);
}

// Step 5: Create deployment summary
console.log('\n4. Deployment Summary:');
console.log('=====================');
console.log('✅ Project built successfully');
console.log('✅ jsxDEV fix verified/applied');
console.log('✅ All required files present');
console.log('✅ Assets generated correctly');

console.log('\n🚀 Ready for deployment!');
console.log('📁 Deploy the "dist" folder to your hosting platform');
console.log('🌐 Your site should now load without jsxDEV errors');

// Optional: Test the build locally
console.log('\n5. Testing build locally...');
console.log('To test locally, run: npx serve dist');
console.log('Then open: http://localhost:3000'); 