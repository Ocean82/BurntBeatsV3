#!/usr/bin/env node

/**
 * Build Server Script with CommonJS Output (.cjs extension)
 * Implements the requested build:server script changes
 */

const { execSync } = require('child_process');
const { existsSync, mkdirSync, statSync } = require('fs');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function buildServerWithCJS() {
  log('🔧 Building server with CommonJS format and .cjs extension', 'info');
  
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }
  
  // Build command exactly as requested by user (using npx)
  const buildCommand = 'npx esbuild server/index.ts --bundle --platform=node --format=cjs --outfile=dist/index.cjs';
  
  try {
    execSync(buildCommand, { stdio: 'inherit' });
    
    // Verify the build output
    if (existsSync('dist/index.cjs')) {
      const stats = statSync('dist/index.cjs');
      const sizeKB = (stats.size / 1024).toFixed(2);
      log(`✅ Server built successfully: dist/index.cjs (${sizeKB} KB)`, 'success');
      log('✅ Format: CommonJS with .cjs extension', 'success');
    } else {
      log('❌ Build failed - dist/index.cjs not created', 'error');
      process.exit(1);
    }
    
  } catch (error) {
    log('❌ Build failed', 'error');
    console.error(error.message);
    process.exit(1);
  }
}

// Execute the build
buildServerWithCJS();