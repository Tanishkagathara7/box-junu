#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { createServer } from 'net';

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(port, () => {
      server.close();
      resolve(true);
    });
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Function to kill process using a port
async function killProcessOnPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = result.split('\n').filter(line => line.includes('LISTENING'));
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const pid = parts[4];
        console.log(`🔄 Killing process ${pid} using port ${port}...`);
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      }
    }
  } catch (error) {
    // Process not found or already killed
  }
}

// Function to start backend
async function startBackend() {
  console.log('🚀 Starting backend server...');
  
  // Check if port 3001 is available
  const portAvailable = await isPortAvailable(3001);
  if (!portAvailable) {
    console.log('⚠️ Port 3001 is in use, attempting to free it...');
    await killProcessOnPort(3001);
    
    // Wait a moment for the port to be freed
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Start backend
  const backend = spawn('npm', ['run', 'dev:backend'], {
    stdio: 'inherit',
    shell: true
  });
  
  backend.on('error', (error) => {
    console.error('❌ Backend failed to start:', error.message);
  });
  
  return backend;
}

// Function to start frontend
function startFrontend() {
  console.log('🚀 Starting frontend server...');
  
  const frontend = spawn('npm', ['run', 'dev:frontend'], {
    stdio: 'inherit',
    shell: true
  });
  
  frontend.on('error', (error) => {
    console.error('❌ Frontend failed to start:', error.message);
  });
  
  return frontend;
}

// Main function
async function main() {
  console.log('🎯 BoxCric Development Environment');
  console.log('==================================');
  
  try {
    // Start backend first
    const backend = await startBackend();
    
    // Wait a moment for backend to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start frontend
    const frontend = startFrontend();
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development servers...');
      backend.kill();
      frontend.kill();
      process.exit(0);
    });
    
    console.log('\n✅ Development environment started!');
    console.log('📱 Frontend: http://localhost:8080 (or next available port)');
    console.log('🔧 Backend: http://localhost:3001');
    console.log('📊 Health check: http://localhost:3001/api/health');
    console.log('\nPress Ctrl+C to stop all servers');
    
  } catch (error) {
    console.error('❌ Failed to start development environment:', error.message);
    process.exit(1);
  }
}

main(); 