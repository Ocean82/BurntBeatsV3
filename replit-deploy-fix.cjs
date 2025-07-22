#!/usr/bin/env node

/**
 * Replit Deployment Fix Script
 * This script ensures all dependencies are installed and builds the project for Replit
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Burnt Beats - Replit Deployment Fix');
console.log('=====================================');

function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
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
    'storage/midi/generated',
    'storage/midi/templates', 
    'storage/voice-bank',
    'storage/voices',
    'storage/models',
    'dist'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created: ${dir}`);
    }
  });
}

function fixTypeScriptIssues() {
  console.log('\n🔧 Fixing TypeScript compilation issues...');
  
  // Ensure tsconfig includes our type fixes
  const serverTsConfig = path.join('server', 'tsconfig.json');
  if (fs.existsSync(serverTsConfig)) {
    try {
      const config = JSON.parse(fs.readFileSync(serverTsConfig, 'utf8'));
      if (!config.include) config.include = [];
      if (!config.include.includes('types/**/*')) {
        config.include.push('types/**/*');
      }
      fs.writeFileSync(serverTsConfig, JSON.stringify(config, null, 2));
      console.log('✅ Updated server tsconfig.json');
    } catch (error) {
      console.log('⚠️  Could not update tsconfig.json:', error.message);
    }
  }
}

async function main() {
  try {
    // Step 1: Ensure directories exist
    ensureDirectories();
    
    // Step 2: Install dependencies
    if (!runCommand('npm install', 'Installing dependencies')) {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
    
    // Step 3: Install missing TypeScript types
    runCommand('npm install --save-dev @types/express-session@^1.18.2', 'Installing express-session types');
    
    // Step 4: Fix TypeScript configuration
    fixTypeScriptIssues();
    
    // Step 5: Try to build the project
    console.log('\n🏗️  Building project...');
    
    // Try esbuild first
    if (runCommand('npx esbuild server/index.ts --bundle --platform=node --target=node20 --format=cjs --outfile=dist/index.js --external:pg-native --external:bufferutil --external:utf-8-validate --external:fsevents', 'Building with esbuild')) {
      console.log('✅ Build completed with esbuild');
    } else {
      // Fallback to TypeScript compiler
      console.log('⚠️  esbuild failed, trying TypeScript compiler...');
      if (runCommand('npx tsc server/index.ts --outDir dist --target es2020 --module commonjs --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck', 'Building with TypeScript')) {
        console.log('✅ Build completed with TypeScript');
      } else {
        console.log('⚠️  Build failed, but server can still run with tsx');
      }
    }
    
    console.log('\n🎉 Deployment fix completed!');
    console.log('\n🚀 To start the server:');
    console.log('   npm run server');
    console.log('\n📝 Or manually:');
    console.log('   npx tsx server/index.ts');
    
  } catch (error) {
    console.error('❌ Deployment fix failed:', error.message);
    process.exit(1);
  }
}

main();
