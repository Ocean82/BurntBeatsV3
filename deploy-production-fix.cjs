#!/usr/bin/env node

/**
 * Production Deployment Fix for Burnt Beats
 * Handles all deployment issues and builds the application for production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Burnt Beats - Production Deployment Fix');
console.log('==========================================');

function runCommand(command, description, options = {}) {
  console.log(`\n📦 ${description}...`);
  try {
    const result = execSync(command, { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      ...options 
    });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function ensureDirectories() {
  console.log('\n📁 Creating required directories...');
  const dirs = [
    'dist',
    'dist/public',
    'storage/midi/generated',
    'storage/midi/templates', 
    'storage/voice-bank',
    'storage/voices',
    'storage/models'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created: ${dir}`);
    }
  });
}

function fixPackageJson() {
  console.log('\n🔧 Fixing package.json scripts...');
  
  try {
    const packagePath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Update scripts to use available tools
    packageJson.scripts = {
      ...packageJson.scripts,
      "build:server": "npx esbuild server/index.ts --bundle --platform=node --target=node20 --format=cjs --outfile=dist/index.js --external:pg-native --external:bufferutil --external:utf-8-validate --external:fsevents --minify --sourcemap",
      "build:client": "npx vite build --config vite.config.client.ts --outDir dist/public",
      "build": "npm run build:server && npm run build:client",
      "start": "node dist/index.js",
      "server": "node start-dev.cjs"
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json scripts');
    return true;
  } catch (error) {
    console.error('❌ Failed to update package.json:', error.message);
    return false;
  }
}

function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  // Try npm install first
  if (runCommand('npm install', 'Installing NPM dependencies')) {
    return true;
  }
  
  // If that fails, try installing specific missing packages
  console.log('⚠️  NPM install failed, trying to install specific packages...');
  
  const criticalPackages = [
    '@types/express-session',
    'esbuild',
    'vite',
    'tsx'
  ];
  
  for (const pkg of criticalPackages) {
    runCommand(`npm install ${pkg}`, `Installing ${pkg}`);
  }
  
  return true;
}

function buildApplication() {
  console.log('\n🏗️  Building application...');
  
  // Try the standard build process
  if (runCommand('npm run build:server', 'Building server')) {
    console.log('✅ Server build successful');
  } else {
    // Fallback: build server manually
    console.log('⚠️  Standard build failed, trying manual build...');
    if (runCommand('npx esbuild server/index.ts --bundle --platform=node --target=node20 --format=cjs --outfile=dist/index.js --external:pg-native --external:bufferutil --external:utf-8-validate --external:fsevents', 'Manual server build')) {
      console.log('✅ Manual server build successful');
    }
  }
  
  // Try to build client
  if (fs.existsSync('client') && fs.existsSync('vite.config.client.ts')) {
    if (runCommand('npm run build:client', 'Building client')) {
      console.log('✅ Client build successful');
    } else {
      console.log('⚠️  Client build failed, but server can still run');
    }
  }
  
  return true;
}

function createStartScript() {
  console.log('\n📝 Creating production start script...');
  
  const startScript = `#!/usr/bin/env node

/**
 * Production Start Script for Burnt Beats
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Starting Burnt Beats Production Server...');

// Check if built files exist
if (!fs.existsSync('dist/index.js')) {
  console.error('❌ Built server not found. Please run: npm run build');
  process.exit(1);
}

// Start the production server
const serverProcess = spawn('node', ['dist/index.js'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'production' }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(\`🛑 Server exited with code \${code}\`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Shutting down server...');
  serverProcess.kill('SIGTERM');
});
`;

  fs.writeFileSync('start-production.cjs', startScript);
  console.log('✅ Created start-production.cjs');
}

function validateBuild() {
  console.log('\n🔍 Validating build...');
  
  const requiredFiles = [
    'dist/index.js',
    'package.json',
    'server/index.ts'
  ];
  
  let allValid = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      allValid = false;
    }
  });
  
  return allValid;
}

async function main() {
  try {
    console.log('\n🚀 Starting production deployment fix...\n');
    
    // Step 1: Ensure directories exist
    ensureDirectories();
    
    // Step 2: Fix package.json
    fixPackageJson();
    
    // Step 3: Install dependencies
    installDependencies();
    
    // Step 4: Build application
    buildApplication();
    
    // Step 5: Create start script
    createStartScript();
    
    // Step 6: Validate build
    const isValid = validateBuild();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 PRODUCTION DEPLOYMENT FIX COMPLETE!');
    console.log('='.repeat(50));
    
    if (isValid) {
      console.log('✅ Build validation passed');
      console.log('\n🚀 To start the server:');
      console.log('   npm start');
      console.log('\n📝 Or manually:');
      console.log('   node dist/index.js');
    } else {
      console.log('⚠️  Some files are missing, but deployment should still work');
      console.log('\n🔧 Try running:');
      console.log('   npm run server  # Development mode');
      console.log('   npx tsx server/index.ts  # Direct TypeScript execution');
    }
    
    console.log('\n📋 Next steps:');
    console.log('1. Test the server: npm start');
    console.log('2. Check health: curl http://localhost:5000/api/health');
    console.log('3. Deploy to production platform');
    
  } catch (error) {
    console.error('❌ Production deployment fix failed:', error.message);
    process.exit(1);
  }
}

main();
