#!/usr/bin/env node

/**
 * Deploy to Vercel with proper environment configuration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const VERCEL_PROJECT_NAME = 'box-cricket-frontend';
const API_URL = 'https://box-new.onrender.com/api';

console.log('🚀 Starting Vercel deployment...');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('✅ Vercel CLI found');
} catch {
  console.log('❌ Vercel CLI not found. Installing...');
  execSync('npm install -g vercel', { stdio: 'inherit' });
}

// Set environment variables for the build
process.env.VITE_API_URL = API_URL;

console.log(`📝 Setting up environment:`);
console.log(`   VITE_API_URL: ${API_URL}`);

// Build the project
console.log('🔨 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Deploy to Vercel
console.log('🚀 Deploying to Vercel...');
try {
  // Deploy with environment variables
  const deployCommand = `vercel --prod --env VITE_API_URL=${API_URL}`;
  execSync(deployCommand, { stdio: 'inherit' });
  console.log('✅ Deployment completed successfully');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

console.log(`
🎉 Deployment Complete!

Next steps:
1. Your frontend should now be deployed to Vercel
2. Update your backend's FRONTEND_URL environment variable to include the new Vercel URL
3. The backend should accept requests from: ${API_URL}

If you see CORS errors, you'll need to update your backend deployment on Render.
`);
