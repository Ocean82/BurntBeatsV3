#!/usr/bin/env node

/**
 * Development server starter for Burnt Beats
 * This script works around PATH issues with tsx/esbuild on Windows
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔥 Starting Burnt Beats Development Server...');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.error('❌ node_modules not found. Please run: npm install');
  process.exit(1);
}

// Try to find tsx in node_modules
const tsxPaths = [
  path.join('node_modules', '.bin', 'tsx.cmd'),
  path.join('node_modules', '.bin', 'tsx'),
  path.join('node_modules', 'tsx', 'dist', 'cli.mjs')
];

let tsxPath = null;
for (const p of tsxPaths) {
  if (fs.existsSync(p)) {
    tsxPath = p;
    break;
  }
}

if (!tsxPath) {
  console.error('❌ tsx not found. Please run: npm install tsx');
  process.exit(1);
}

console.log(`✅ Found tsx at: ${tsxPath}`);
console.log('🚀 Starting server...');

// Start the server
const serverProcess = spawn('node', [tsxPath, 'server/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`🛑 Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGTERM');
});
