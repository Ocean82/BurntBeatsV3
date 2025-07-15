#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Verifies all deployment artifacts are ready
 */

const { existsSync, readFileSync, statSync } = require('fs');

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

function formatSize(bytes) {
  const mb = (bytes / 1024 / 1024).toFixed(2);
  return `${mb} MB`;
}

function verifyFile(path, description) {
  if (existsSync(path)) {
    const stats = statSync(path);
    log(`✅ ${description}: ${formatSize(stats.size)}`, 'success');
    return true;
  } else {
    log(`❌ ${description}: Missing`, 'error');
    return false;
  }
}

function main() {
  log('🔍 Burnt Beats Deployment Verification', 'info');
  log('=====================================', 'info');

  const checks = [
    { path: 'dist/index.js', desc: 'Server Bundle' },
    { path: 'dist/package.json', desc: 'Production Package' },
    { path: 'dist/public/index.html', desc: 'Client Application' },
    { path: '.replit', desc: 'Replit Configuration' },
    { path: 'quick-deploy.cjs', desc: 'Build Script' }
  ];

  let allValid = true;
  let totalSize = 0;

  for (const check of checks) {
    const valid = verifyFile(check.path, check.desc);
    if (valid && existsSync(check.path)) {
      totalSize += statSync(check.path).size;
    }
    allValid = allValid && valid;
  }

  log('', 'info');
  log(`📊 Total deployment size: ${formatSize(totalSize)}`, 'info');

  // Check package.json dependencies
  if (existsSync('dist/package.json')) {
    const pkg = JSON.parse(readFileSync('dist/package.json', 'utf8'));
    const depCount = Object.keys(pkg.dependencies || {}).length;
    log(`📦 Production dependencies: ${depCount}`, 'info');
  }

  // Check .replit deployment configuration
  if (existsSync('.replit')) {
    const replit = readFileSync('.replit', 'utf8');
    if (replit.includes('[deployment]')) {
      log('✅ Deployment configuration present', 'success');
    } else {
      log('⚠️ No deployment configuration found', 'warn');
    }
  }

  log('', 'info');
  if (allValid) {
    log('🎉 All deployment checks passed!', 'success');
    log('🚀 Ready for Replit deployment', 'success');
    log('', 'info');
    log('Next steps:', 'info');
    log('1. Click the Deploy button in Replit', 'info');
    log('2. Wait for deployment to complete', 'info');
    log('3. Test the deployed application', 'info');
  } else {
    log('❌ Deployment verification failed', 'error');
    log('Run: node quick-deploy.cjs', 'error');
  }
}

main();