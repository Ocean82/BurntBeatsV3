#!/usr/bin/env node

/**
 * Simple Production Build Script for Burnt Beats
 * Fixes deployment by using npm scripts directly
 */

const { execSync } = require('child_process');
const { existsSync, mkdirSync } = require('fs');
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

function runCommand(command, description) {
  log(`🔄 ${description}`, 'info');
  try {
    execSync(command, { stdio: 'inherit', timeout: 300000 });
    log(`✅ ${description} completed`, 'success');
  } catch (error) {
    log(`❌ ${description} failed`, 'error');
    throw error;
  }
}

function ensureDirectories() {
  const dirs = ['dist', 'dist/public'];
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      log(`📁 Created directory: ${dir}`, 'info');
    }
  });
}

async function main() {
  try {
    log('🎵 Burnt Beats - Simple Production Build', 'info');
    log('=====================================', 'info');

    // Ensure directories exist
    ensureDirectories();

    // Install dependencies (including devDependencies for build)
    runCommand('npm install', 'Installing all dependencies');

    // Build server first
    runCommand('npm run build:server', 'Building server bundle');

    // Build client
    runCommand('npm run build:client', 'Building client application');

    // Verify builds
    const requiredFiles = ['dist/index.js', 'dist/public/index.html'];
    let allValid = true;

    for (const file of requiredFiles) {
      if (existsSync(file)) {
        log(`✅ ${file} exists`, 'success');
      } else {
        log(`❌ Missing ${file}`, 'error');
        allValid = false;
      }
    }

    if (allValid) {
      log('🎉 Build completed successfully!', 'success');
      log('📁 Ready for deployment in ./dist/', 'success');
    } else {
      throw new Error('Build validation failed');
    }

  } catch (error) {
    log(`💥 Build failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

main();