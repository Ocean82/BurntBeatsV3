#!/usr/bin/env node

/**
 * Safe Build Script for Burnt Beats
 * Alternative to package.json build:client command that prevents bus errors
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function safeBuild() {
  log('🚀 Starting safe client build', 'info');
  
  // Set memory-safe environment variables
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    NODE_OPTIONS: '--max-old-space-size=2048 --max-semi-space-size=64',
    VITE_API_URL: '/api'
  };
  
  try {
    // Try main vite config first (safer)
    log('📦 Building with main vite config (memory safe)', 'info');
    execSync('npx vite build --outDir dist/public', { 
      stdio: 'inherit',
      env,
      timeout: 180000
    });
    
    if (existsSync('dist/public/index.html')) {
      log('✅ Safe build completed successfully', 'success');
      return true;
    }
  } catch (error) {
    log('⚠️ Main build failed, trying client config', 'warn');
    
    try {
      // Fallback to client config with memory limits
      execSync('npx vite build --config vite.config.client.ts --outDir dist/public', { 
        stdio: 'inherit',
        env,
        timeout: 180000
      });
      
      if (existsSync('dist/public/index.html')) {
        log('✅ Client config build completed successfully', 'success');
        return true;
      }
    } catch (clientError) {
      log('❌ Both build approaches failed', 'error');
      log('💡 Consider using: node safe-deploy.cjs for fallback client', 'info');
      return false;
    }
  }
}

if (require.main === module) {
  const success = safeBuild();
  process.exit(success ? 0 : 1);
}

module.exports = { safeBuild };