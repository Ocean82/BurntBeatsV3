#!/usr/bin/env node

/**
 * Real Production Build Script - Fix the actual Vite installation and build
 */

const { execSync } = require('child_process');
const { existsSync, writeFileSync } = require('fs');
const path = require('path');

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

function main() {
  try {
    log('🔧 Fixing Vite build issues by installing dependencies properly', 'info');
    
    // Check if Vite is installed in main dependencies
    try {
      execSync('npx vite --version', { stdio: 'pipe' });
      log('✅ Vite is available', 'success');
    } catch (error) {
      log('❌ Vite not found, this is the real problem', 'error');
      log('The deployment failed because Vite is not properly installed or accessible', 'error');
      
      // Try to use the installed version
      try {
        const result = execSync('npm list vite', { encoding: 'utf8', stdio: 'pipe' });
        log(`Vite installation status: ${result}`, 'info');
      } catch (listError) {
        log('Vite is not properly installed in the project', 'error');
      }
      
      return false;
    }
    
    // If Vite is available, try the actual build
    log('🏗️ Attempting real Vite build with proper configuration', 'info');
    
    try {
      // Try building with the existing configuration
      execSync('npx vite build --config vite.config.client.ts --outDir dist/public', { 
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'production'
        }
      });
      
      if (existsSync('dist/public/index.html')) {
        log('✅ Real Vite build completed successfully', 'success');
        return true;
      }
    } catch (buildError) {
      log(`❌ Vite build failed: ${buildError.message}`, 'error');
      
      // Try alternative approach
      try {
        log('🔄 Trying main vite config approach', 'info');
        execSync('npx vite build --outDir dist/public', { 
          stdio: 'inherit',
          env: {
            ...process.env,
            NODE_ENV: 'production'
          }
        });
        
        if (existsSync('dist/public/index.html')) {
          log('✅ Alternative build approach succeeded', 'success');
          return true;
        }
      } catch (altError) {
        log(`❌ All build approaches failed: ${altError.message}`, 'error');
        return false;
      }
    }
    
  } catch (error) {
    log(`💥 Build script failed: ${error.message}`, 'error');
    return false;
  }
}

if (require.main === module) {
  const success = main();
  if (!success) {
    log('🚨 The real issue is that Vite is not properly installed or configured', 'error');
    log('💡 Need to fix the dependency installation first', 'warn');
  }
  process.exit(success ? 0 : 1);
}