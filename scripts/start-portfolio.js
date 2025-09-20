#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Portfolio with Module Federation...');

// Change to project root
process.chdir(path.join(__dirname, '..'));

try {
  // Step 1: Build remote micro-frontends
  console.log('📦 Building remote micro-frontends...');
  execSync('pnpm build:remotes', { stdio: 'inherit' });
  console.log('✅ Remote builds completed!');

  // Step 2: Start remotes in preview mode (background)
  console.log('🔄 Starting remote services in preview mode...');
  const remotesProcess = spawn('pnpm', ['preview:remotes'], {
    stdio: 'pipe',
    shell: true,
    detached: process.platform !== 'win32'
  });

  // Wait for services to start
  console.log('⏳ Waiting for remote services to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Step 3: Start portfolio-home
  console.log('🏠 Starting portfolio-home...');
  console.log('🎉 Portfolio is ready!');
  console.log('📍 Services running on:');
  console.log('  - Portfolio Home: http://localhost:5004 (will auto-assign if busy)');
  console.log('  - Flash Card App: http://localhost:5001');
  console.log('  - CV Generator: http://localhost:5002');
  console.log('  - Tarot Reader: http://localhost:5003');
  console.log('');
  console.log('Press Ctrl+C to stop all services');

  // Start portfolio-home and keep it running
  const portfolioProcess = spawn('pnpm', ['start:portfolio'], {
    stdio: 'inherit',
    shell: true
  });

  // Handle cleanup
  const cleanup = () => {
    console.log('\n🛑 Stopping services...');
    if (remotesProcess) {
      remotesProcess.kill();
    }
    if (portfolioProcess) {
      portfolioProcess.kill();
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  portfolioProcess.on('close', (code) => {
    cleanup();
  });

} catch (error) {
  console.error('❌ Error starting portfolio:', error.message);
  process.exit(1);
}