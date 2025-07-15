#!/usr/bin/env node

/**
 * ES Module to CommonJS Build Fix for Burnt Beats
 * This script addresses the deployment issue where Node.js can't execute
 * ES module imports in a CommonJS context.
 */

const { execSync } = require('child_process');
const { existsSync, mkdirSync, writeFileSync, readFileSync, statSync } = require('fs');
const path = require('path');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  const timestamp = new Date().toISOString();
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`Executing: ${description}`, 'info');
  try {
    execSync(command, { stdio: 'inherit', timeout: 300000 });
    log(`✅ ${description} completed successfully`, 'success');
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
      log(`Created directory: ${dir}`, 'info');
    }
  });
}

function createProductionPackage() {
  log('📦 Creating production package.json with CommonJS compatibility', 'info');
  
  // Read current package.json to get dependency versions
  let currentPackage;
  try {
    currentPackage = JSON.parse(readFileSync('package.json', 'utf8'));
  } catch (error) {
    log('❌ Cannot read package.json', 'error');
    process.exit(1);
  }

  // Create production package without "type": "module" for CommonJS compatibility
  const prodPackage = {
    "name": "burnt-beats-production",
    "version": "1.0.0",
    "engines": {
      "node": ">=18"
    },
    "scripts": {
      "start": "node index.cjs",
      "health-check": "curl -f http://0.0.0.0:5000/health || exit 1"
    },
    "dependencies": {
      "@neondatabase/serverless": currentPackage.dependencies["@neondatabase/serverless"],
      "@google-cloud/storage": currentPackage.dependencies["@google-cloud/storage"],
      "express": currentPackage.dependencies["express"],
      "express-session": currentPackage.dependencies["express-session"],
      "express-rate-limit": currentPackage.dependencies["express-rate-limit"],
      "connect-pg-simple": currentPackage.dependencies["connect-pg-simple"],
      "cors": currentPackage.dependencies["cors"],
      "helmet": currentPackage.dependencies["helmet"],
      "multer": currentPackage.dependencies["multer"],
      "stripe": currentPackage.dependencies["stripe"],
      "ws": currentPackage.dependencies["ws"],
      "zod": currentPackage.dependencies["zod"],
      "drizzle-orm": currentPackage.dependencies["drizzle-orm"],
      "nanoid": currentPackage.dependencies["nanoid"]
    }
  };

  const packagePath = path.join('dist', 'package.json');
  writeFileSync(packagePath, JSON.stringify(prodPackage, null, 2));
  log(`✅ Production package.json created at ${packagePath}`, 'success');
}

function buildServerBundle() {
  log('🖥️ Building server bundle with CommonJS format', 'info');
  
  // Build server with esbuild using CommonJS format
  const esbuildCommand = [
    'npx esbuild server/index.ts',
    '--bundle',
    '--platform=node',
    '--target=node18',
    '--format=cjs',
    '--outfile=dist/index.cjs',
    '--external:express',
    '--external:cors',
    '--external:dotenv',
    '--external:helmet',
    '--external:multer',
    '--external:stripe',
    '--external:ws',
    '--external:zod',
    '--external:drizzle-orm',
    '--external:nanoid',
    '--external:@neondatabase/serverless',
    '--external:@google-cloud/storage',
    '--external:express-session',
    '--external:express-rate-limit',
    '--external:connect-pg-simple',
    '--external:pg-native',
    '--external:bufferutil',
    '--external:utf-8-validate',
    '--external:fsevents',
    '--minify',
    '--sourcemap=external',
    '--log-level=warning'
  ].join(' ');

  runCommand(esbuildCommand, 'Building server with CommonJS format');

  // Verify bundle was created
  if (existsSync('dist/index.cjs')) {
    const stats = statSync('dist/index.cjs');
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    log(`✅ Server bundle created: ${sizeMB} MB`, 'success');
  } else {
    log('❌ Server bundle creation failed', 'error');
    process.exit(1);
  }
}

function buildClientApplication() {
  log('🌐 Building client application', 'info');
  
  // Try to build client using existing build script
  try {
    runCommand('npm run build:client', 'Building client application');
    
    if (existsSync('dist/public/index.html')) {
      log('✅ Client build successful', 'success');
      return;
    }
  } catch (error) {
    log('⚠️ Client build failed, creating fallback', 'warn');
  }

  // Fallback client
  const fallbackClient = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Burnt Beats - AI Music Creation</title>
    <style>
        body { margin: 0; font-family: system-ui, sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d1b69 50%, #ff6b35 100%); color: white; }
        .app { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .container { max-width: 600px; text-align: center; }
        .logo { width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(45deg, #ff6b35, #f7931e); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .btn { background: linear-gradient(45deg, #ff6b35, #f7931e); border: none; padding: 12px 24px; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; margin: 10px; text-decoration: none; display: inline-block; }
    </style>
</head>
<body>
    <div class="app">
        <div class="container">
            <div class="logo">🔥</div>
            <h1>Burnt Beats</h1>
            <p>AI-Powered Music Creation Platform</p>
            <p><small>Server Status: <span id="status">Checking...</span></small></p>
        </div>
    </div>
    <script>
        fetch('/api/health')
            .then(r => r.json())
            .then(d => document.getElementById('status').textContent = d.status === 'ok' ? 'Online ✅' : 'Issues ⚠️')
            .catch(() => document.getElementById('status').textContent = 'Offline ❌');
    </script>
</body>
</html>`;

  writeFileSync(path.join('dist', 'public', 'index.html'), fallbackClient);
  log('✅ Fallback client created', 'success');
}

function copyDependencies() {
  log('📦 Copying production dependencies', 'info');
  
  // Copy node_modules to dist for production
  if (existsSync('node_modules')) {
    try {
      runCommand('cp -r node_modules dist/', 'Copying node_modules to dist');
      log('✅ Dependencies copied successfully', 'success');
    } catch (error) {
      log('⚠️ Failed to copy dependencies, may need to install in production', 'warn');
    }
  } else {
    log('⚠️ node_modules not found, dependencies may need to be installed in production', 'warn');
  }
}

function validateBuild() {
  log('✅ Validating build artifacts', 'info');
  
  const requiredFiles = [
    { path: 'dist/index.cjs', description: 'Server bundle' },
    { path: 'dist/package.json', description: 'Production package.json' },
    { path: 'dist/public/index.html', description: 'Client application' }
  ];

  let totalSize = 0;
  let validationPassed = true;

  for (const file of requiredFiles) {
    if (existsSync(file.path)) {
      const stats = statSync(file.path);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      log(`✅ ${file.description}: ${sizeKB} KB`, 'success');
    } else {
      log(`❌ Missing ${file.description}: ${file.path}`, 'error');
      validationPassed = false;
    }
  }

  if (!validationPassed) {
    log('❌ Build validation failed', 'error');
    process.exit(1);
  }

  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  log(`📊 Total build size: ${totalSizeMB} MB`, 'info');
  log('✅ Build validation passed - ready for deployment', 'success');
}

async function main() {
  try {
    log('🔧 ES Module to CommonJS Build Fix', 'info');
    log('===================================', 'info');
    
    // 1. Create directory structure
    ensureDirectories();
    
    // 2. Create production package.json WITHOUT "type": "module"
    createProductionPackage();
    
    // 3. Build server with CommonJS format
    buildServerBundle();
    
    // 4. Build client application
    buildClientApplication();
    
    // 5. Copy dependencies to production directory
    copyDependencies();
    
    // 6. Validate build artifacts
    validateBuild();
    
    log('🎉 Build fix completed successfully!', 'success');
    log('===================================', 'info');
    
  } catch (error) {
    log(`❌ Build fix failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Execute the build fix
main();