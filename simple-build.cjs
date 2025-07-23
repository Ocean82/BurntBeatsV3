#!/usr/bin/env node

/**
 * Simple Build Script for Burnt Beats
 * Converts TypeScript to JavaScript and fixes compatibility issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Burnt Beats - Simple Build');
console.log('==============================');

// Step 1: Create dist directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
  console.log('✅ Created dist directory');
}

// Step 2: Try TypeScript compilation first
console.log('\n📝 Compiling TypeScript...');
try {
  execSync('npx tsc --project server/tsconfig.json --outDir dist --target es2020 --module commonjs', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful');
  
  // Fix the compiled JavaScript
  const indexPath = 'dist/index.js';
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Fix import.meta.url
    content = content.replace(/import\.meta\.url/g, '"file://" + __filename');
    
    // Fix ES modules imports to CommonJS
    content = content.replace(/import\s+(.+)\s+from\s+['"](.+)['"];?/g, 'const $1 = require("$2");');
    content = content.replace(/export\s+\{([^}]+)\}/g, 'module.exports = { $1 };');
    content = content.replace(/export\s+default\s+(.+);?/g, 'module.exports = $1;');
    content = content.replace(/export\s+const\s+(.+)\s*=/g, 'const $1 = module.exports.$1 =');
    
    fs.writeFileSync(indexPath, content);
    console.log('✅ Fixed JavaScript compatibility');
  }
  
} catch (error) {
  console.log('⚠️  TypeScript compilation failed, trying esbuild...');
  
  // Fallback to esbuild
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
      '--external:fsevents'
    ].join(' ');
    
    execSync(buildCommand, { stdio: 'inherit' });
    console.log('✅ esbuild compilation successful');
  } catch (esbuildError) {
    console.error('❌ Both TypeScript and esbuild failed');
    process.exit(1);
  }
}

// Step 3: Create package.json for dist
console.log('\n📄 Creating package.json...');
const packageJson = {
  "name": "burnt-beats-server",
  "version": "1.0.0",
  "main": "index.js",
  "type": "commonjs",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.0",
    "bcrypt": "^5.1.1",
    "helmet": "^8.1.0",
    "express-rate-limit": "^7.5.1",
    "express-session": "^1.18.1",
    "multer": "^2.0.2"
  },
  "engines": {
    "node": ">=20.0.0"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Package.json created');

// Step 4: Install dependencies in dist
console.log('\n📦 Installing dependencies...');
try {
  execSync('cd dist && npm install --production --no-optional', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.log('⚠️  Some dependencies failed to install');
}

// Step 5: Create environment file
console.log('\n🔧 Creating environment file...');
const envContent = `NODE_ENV=production
PORT=5000
SESSION_SECRET=your-secret-key-change-in-production
`;

fs.writeFileSync('dist/.env', envContent);
console.log('✅ Environment file created');

// Step 6: Validate build
console.log('\n✅ Validating build...');
if (fs.existsSync('dist/index.js')) {
  const stats = fs.statSync('dist/index.js');
  console.log(`✅ Server bundle: ${(stats.size / 1024).toFixed(1)}KB`);
  
  console.log('\n🎉 Build completed successfully!');
  console.log('\n🚀 To start the server:');
  console.log('   cd dist');
  console.log('   node index.js');
  console.log('   OR: npm start');
  
} else {
  console.error('❌ Build validation failed');
  process.exit(1);
}
