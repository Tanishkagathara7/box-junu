#!/usr/bin/env node

/**
 * Quick deployment script to fix CORS issue
 */

import { execSync } from 'child_process';

console.log('🚨 URGENT: Fixing CORS issue for https://box-new.vercel.app');
console.log('');

// Check git status
console.log('📊 Checking current git status...');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    console.log('📝 Changes detected:');
    console.log(status);
  } else {
    console.log('✅ No changes to commit');
  }
} catch (error) {
  console.log('⚠️ Could not check git status');
}

// Stage and commit changes
console.log('');
console.log('📦 Staging and committing CORS fix...');
try {
  execSync('git add server/index.js', { stdio: 'inherit' });
  execSync('git commit -m "URGENT: Add https://box-new.vercel.app to CORS whitelist"', { stdio: 'inherit' });
  console.log('✅ Changes committed successfully');
} catch (error) {
  console.log('⚠️ Commit may have failed or no changes to commit');
}

// Push to trigger Render deployment
console.log('');
console.log('🚀 Pushing to trigger Render deployment...');
try {
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ Pushed to GitHub successfully');
} catch (error) {
  console.error('❌ Failed to push to GitHub:', error.message);
  process.exit(1);
}

console.log('');
console.log('🎉 CORS fix deployed!');
console.log('');
console.log('📋 What happens next:');
console.log('1. ⏳ Render will automatically detect the push and start deploying');
console.log('2. 🕐 Wait 2-3 minutes for deployment to complete');
console.log('3. 🔄 Refresh your frontend at https://box-new.vercel.app');
console.log('4. ✅ Your cricket grounds should load properly');
console.log('');
console.log('🔗 Monitor deployment at: https://dashboard.render.com');
console.log('');
console.log('💡 If still not working after 5 minutes, check:');
console.log('   - Render deployment logs');
console.log('   - Browser console for any remaining errors');
console.log('   - Try hard refresh (Ctrl+F5) in your browser');
