#!/usr/bin/env node

/**
 * Quick Server Fix for Burnt Beats
 * Addresses bcrypt and import.meta issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Burnt Beats - Quick Server Fix');
console.log('==================================');

// Create dist directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
  console.log('✅ Created dist directory');
}

// Build with proper externals and fixes
console.log('\n🔧 Building server with fixes...');
try {
  const buildCommand = [
    'npx esbuild server/index.ts',
    '--bundle',
    '--platform=node',
    '--target=node20',
    '--format=cjs',
    '--outfile=dist/index.js',
    '--external:bcrypt',
    '--external:pg-native',
    '--external:bufferutil',
    '--external:utf-8-validate',
    '--external:fsevents',
    '--define:import.meta.url=\'"file://"+__filename\'',
    '--define:process.env.NODE_ENV=\'"production"\'',
    '--minify'
  ].join(' ');
  
  execSync(buildCommand, { stdio: 'inherit' });
  console.log('✅ Server built successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Try simpler build
  console.log('\n🔄 Trying simpler build...');
  try {
    const simpleCommand = 'npx esbuild server/index.ts --bundle --platform=node --format=cjs --outfile=dist/index.js --external:bcrypt';
    execSync(simpleCommand, { stdio: 'inherit' });
    console.log('✅ Simple build successful');
  } catch (simpleError) {
    console.error('❌ Simple build also failed');
    process.exit(1);
  }
}

// Create minimal package.json for dist
const distPackageJson = {
  "name": "burnt-beats-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.0"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(distPackageJson, null, 2));
console.log('✅ Created dist/package.json');

// Install bcrypt in dist
console.log('\n📦 Installing bcrypt in dist...');
try {
  execSync('cd dist && npm install bcrypt --no-optional', { stdio: 'inherit' });
  console.log('✅ bcrypt installed in dist');
} catch (error) {
  console.log('⚠️  bcrypt install failed, trying alternative...');
  try {
    execSync('cd dist && npm install bcrypt@5.1.1 --no-optional --force', { stdio: 'inherit' });
    console.log('✅ bcrypt installed with force');
  } catch (forceError) {
    console.log('⚠️  bcrypt install failed, server may not work');
  }
}

console.log('\n🎉 Server fix completed!');
console.log('\n🚀 To start the server:');
console.log('   cd dist && node index.js');
console.log('   OR: cd dist && npm start');

// Validate the build
if (fs.existsSync('dist/index.js')) {
  const stats = fs.statSync('dist/index.js');
  console.log(`\n📊 Server bundle size: ${(stats.size / 1024).toFixed(1)}KB`);
} else {
  console.error('\n❌ Build validation failed');
  process.exit(1);
}
