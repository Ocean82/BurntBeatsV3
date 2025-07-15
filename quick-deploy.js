
#!/usr/bin/env node

/**
 * Quick deployment script for Burnt Beats
 * One-command deployment for Replit
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Burnt Beats - Quick Deploy');
console.log('=============================');

function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkPrerequisites() {
  console.log('\n🔍 Checking prerequisites...');
  
  // Check Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js ${nodeVersion}`);
  } catch (error) {
    console.error('❌ Node.js not found');
    process.exit(1);
  }

  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm ${npmVersion}`);
  } catch (error) {
    console.error('❌ npm not found');
    process.exit(1);
  }

  // Check required files
  const requiredFiles = ['package.json', 'server/index.ts'];
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.error(`❌ ${file} not found`);
      process.exit(1);
    }
  }
}

function main() {
  checkPrerequisites();
  
  // Install dependencies
  runCommand('npm install', 'Installing dependencies');
  
  // Run environment validation
  if (fs.existsSync('validate-environment.js')) {
    runCommand('node validate-environment.js', 'Validating environment');
  }
  
  // Build application
  runCommand('node deploy-production-fix.cjs', 'Building application');
  
  // Validate build
  if (!fs.existsSync('dist/index.cjs')) {
    console.error('❌ Build validation failed - server bundle not found');
    process.exit(1);
  }
  
  if (!fs.existsSync('dist/public/index.html')) {
    console.error('❌ Build validation failed - client bundle not found');
    process.exit(1);
  }
  
  console.log('\n🎉 Deployment completed successfully!');
  console.log('📁 Built files are in ./dist/');
  console.log('🚀 Start with: node start-server.js');
  console.log('🏥 Health check: node health-check.js');
}

main();
