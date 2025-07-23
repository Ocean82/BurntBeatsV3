#!/usr/bin/env node

/**
 * Lightweight Production Deployment for Burnt Beats
 * Fixes bcrypt, import.meta, and size issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Burnt Beats - Lightweight Production Deploy');
console.log('==============================================');

// Step 1: Clean up large dependencies to reduce size
console.log('\n🧹 Cleaning up large dependencies...');
const largeDeps = [
  'node_modules/@playwright',
  'node_modules/playwright',
  'node_modules/playwright-core',
  'node_modules/@google-cloud',
  'node_modules/@testing-library',
  'node_modules/jest',
  'node_modules/@jest',
  'node_modules/vitest',
  'node_modules/@vitest',
  'node_modules/esbuild-windows-64',
  'node_modules/@esbuild/win32-x64',
  'node_modules/lightningcss-win32-x64-msvc',
  'node_modules/@rollup',
  'node_modules/rollup',
  'node_modules/@swc',
  'node_modules/pdfkit',
  'node_modules/fontkit'
];

let sizeReduced = 0;
largeDeps.forEach(dep => {
  try {
    if (fs.existsSync(dep)) {
      const stats = fs.statSync(dep);
      if (stats.isDirectory()) {
        const size = getDirSize(dep);
        fs.rmSync(dep, { recursive: true, force: true });
        sizeReduced += size;
        console.log(`✅ Removed ${dep} (${(size / 1024 / 1024).toFixed(1)}MB)`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Could not remove ${dep}`);
  }
});

console.log(`💾 Total size reduced: ${(sizeReduced / 1024 / 1024).toFixed(1)}MB`);

function getDirSize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stats.size;
      }
    });
  } catch (error) {
    // Ignore errors
  }
  return size;
}

// Step 2: Create required directories
console.log('\n📁 Creating required directories...');
const dirs = [
  'dist',
  'storage/midi/generated',
  'storage/midi/templates',
  'storage/voice-bank',
  'storage/voices'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  }
});

// Step 3: Install minimal production dependencies
console.log('\n📦 Installing minimal production dependencies...');
try {
  execSync('npm install --production --no-optional --prefer-offline --no-audit --no-fund', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('✅ Production dependencies installed');
} catch (error) {
  console.log('⚠️  Some dependencies failed, continuing...');
}

// Step 4: Fix server code for CommonJS compatibility
console.log('\n🔧 Fixing server code for CommonJS...');
const serverIndexPath = 'server/index.ts';
if (fs.existsSync(serverIndexPath)) {
  let serverCode = fs.readFileSync(serverIndexPath, 'utf8');
  
  // Fix import.meta.url issue
  if (serverCode.includes('import.meta.url')) {
    serverCode = serverCode.replace(
      /const __filename = fileURLToPath\(import\.meta\.url\);/g,
      'const __filename = __filename || require.resolve("./index.js");'
    );
    serverCode = serverCode.replace(
      /import\.meta\.url/g,
      '"file://" + __filename'
    );
    
    fs.writeFileSync(serverIndexPath + '.backup', fs.readFileSync(serverIndexPath));
    fs.writeFileSync(serverIndexPath, serverCode);
    console.log('✅ Fixed import.meta.url compatibility');
  }
}

// Step 5: Build server with all fixes
console.log('\n🔧 Building server with fixes...');
try {
  const buildCommand = [
    'npx esbuild server/index.ts',
    '--bundle',
    '--platform=node',
    '--target=node20',
    '--format=cjs',
    '--outfile=dist/index.js',
    '--external:pg-native',
    '--external:bufferutil', 
    '--external:utf-8-validate',
    '--external:fsevents',
    '--external:bcrypt',
    '--external:sharp',
    '--external:canvas',
    '--external:sqlite3',
    '--define:import.meta.url=\'"file://"+__filename\'',
    '--define:process.env.NODE_ENV=\'"production"\'',
    '--minify',
    '--sourcemap'
  ].join(' ');
  
  execSync(buildCommand, { stdio: 'inherit' });
  console.log('✅ Server built successfully');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  
  // Fallback: Try without minification
  console.log('\n🔄 Trying fallback build without minification...');
  try {
    const fallbackCommand = [
      'npx esbuild server/index.ts',
      '--bundle',
      '--platform=node',
      '--target=node20',
      '--format=cjs',
      '--outfile=dist/index.js',
      '--external:bcrypt',
      '--define:import.meta.url=\'"file://"+__filename\''
    ].join(' ');
    
    execSync(fallbackCommand, { stdio: 'inherit' });
    console.log('✅ Fallback build successful');
  } catch (fallbackError) {
    console.error('❌ Fallback build also failed');
    process.exit(1);
  }
}

// Step 6: Create production package.json
console.log('\n📄 Creating production package.json...');
const prodPackageJson = {
  "name": "burnt-beats-production",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.0",
    "bcrypt": "^5.1.1",
    "helmet": "^8.1.0",
    "express-rate-limit": "^7.5.1"
  },
  "engines": {
    "node": ">=20.0.0"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
console.log('✅ Production package.json created');

// Step 7: Install production dependencies in dist
console.log('\n📦 Installing dependencies in dist...');
try {
  execSync('cd dist && npm install --production --no-optional', { stdio: 'inherit' });
  console.log('✅ Production dependencies installed in dist');
} catch (error) {
  console.log('⚠️  Some dist dependencies failed, server may still work');
}

// Step 8: Create startup script
console.log('\n🚀 Creating startup script...');
const startupScript = `#!/usr/bin/env node

// Burnt Beats Production Startup
console.log('🔥 Starting Burnt Beats Production Server...');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
try {
  require('./index.js');
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}
`;

fs.writeFileSync('dist/start.js', startupScript);
console.log('✅ Startup script created');

// Step 9: Validate build
console.log('\n✅ Validating build...');
if (fs.existsSync('dist/index.js')) {
  const stats = fs.statSync('dist/index.js');
  console.log(`✅ Server bundle: ${(stats.size / 1024).toFixed(1)}KB`);
  
  // Check if bcrypt is properly externalized
  const bundleContent = fs.readFileSync('dist/index.js', 'utf8');
  if (bundleContent.includes('require("bcrypt")')) {
    console.log('✅ bcrypt properly externalized');
  } else {
    console.log('⚠️  bcrypt may not be properly externalized');
  }
  
  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n🚀 To start the server:');
  console.log('   cd dist && node start.js');
  console.log('   OR: cd dist && node index.js');
  console.log('   OR: npm start (from dist directory)');
  
} else {
  console.error('❌ Build validation failed - dist/index.js not found');
  process.exit(1);
}

// Restore backup if exists
if (fs.existsSync(serverIndexPath + '.backup')) {
  fs.renameSync(serverIndexPath + '.backup', serverIndexPath);
  console.log('✅ Restored original server code');
}
