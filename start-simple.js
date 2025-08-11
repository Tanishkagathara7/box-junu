#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🚀 Starting BoxCric Development Environment');
console.log('==========================================');

// Start backend
console.log('\n🔧 Starting backend server...');
const backend = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('\n📱 Starting frontend server...');
  const frontend = spawn('npm', ['run', 'dev:frontend'], {
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}, 3000);

console.log('\n✅ Servers starting...');
console.log('🔧 Backend: http://localhost:3001');
console.log('📱 Frontend: Will start on next available port');
console.log('📊 Health check: http://localhost:3001/api/health');
console.log('\nPress Ctrl+C to stop all servers'); 