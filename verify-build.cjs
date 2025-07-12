
#!/usr/bin/env node

const { existsSync, statSync } = require('fs');
const path = require('path');

function log(message, type = 'info') {
  const colors = { info: '\x1b[36m', success: '\x1b[32m', error: '\x1b[31m', reset: '\x1b[0m' };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function verifyBuild() {
  log('🔍 Verifying build artifacts...');
  
  const requiredFiles = [
    'dist/index.cjs',
    'dist/package.json', 
    'dist/public/index.html',
    'dist/public/burnt-beats-app.js'
  ];

  let allValid = true;

  for (const file of requiredFiles) {
    if (existsSync(file)) {
      const stats = statSync(file);
      const sizeKB = (stats.size / 1024).toFixed(2);
      log(`✅ ${file}: ${sizeKB} KB`, 'success');
    } else {
      log(`❌ Missing: ${file}`, 'error');
      allValid = false;
    }
  }

  if (allValid) {
    log('✅ All build artifacts verified successfully', 'success');
    process.exit(0);
  } else {
    log('❌ Build verification failed', 'error');
    process.exit(1);
  }
}

verifyBuild();
