
#!/usr/bin/env node

const http = require('http');
const path = require('path');
const fs = require('fs');

function checkDeploymentReadiness() {
  console.log('🔍 Checking deployment readiness...\n');
  
  const checks = [
    {
      name: 'Server build exists',
      check: () => fs.existsSync('dist/index.js'),
      fix: 'Run: node deploy-production-fix.cjs'
    },
    {
      name: 'Production package.json exists',
      check: () => fs.existsSync('dist/package.json'),
      fix: 'Ensure deploy script creates package.json'
    },
    {
      name: 'Environment file exists',
      check: () => fs.existsSync('.env'),
      fix: 'Copy .env.example to .env and configure'
    },
    {
      name: 'Storage directories exist',
      check: () => fs.existsSync('storage/midi/generated'),
      fix: 'Create storage directories'
    }
  ];

  let allPassed = true;
  
  checks.forEach(check => {
    const passed = check.check();
    console.log(`${passed ? '✅' : '❌'} ${check.name}`);
    if (!passed) {
      console.log(`   Fix: ${check.fix}`);
      allPassed = false;
    }
  });

  if (allPassed) {
    console.log('\n🎉 All deployment checks passed!');
    console.log('🚀 Ready to deploy with: npm run build:production');
  } else {
    console.log('\n⚠️  Some checks failed. Please fix the issues above.');
  }

  return allPassed;
}

function testServerStartup() {
  if (!fs.existsSync('dist/index.js')) {
    console.log('❌ Server build not found. Run deployment build first.');
    return;
  }

  console.log('\n🧪 Testing server startup...');
  
  const { spawn } = require('child_process');
  const server = spawn('node', ['index.js'], {
    cwd: 'dist',
    env: { ...process.env, PORT: '5001' }
  });

  let startupSuccess = false;
  
  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Server output:', output);
    if (output.includes('server running')) {
      startupSuccess = true;
      console.log('✅ Server started successfully');
      server.kill();
    }
  });

  server.stderr.on('data', (data) => {
    console.log('Server error:', data.toString());
  });

  setTimeout(() => {
    if (!startupSuccess) {
      console.log('❌ Server startup timeout');
      server.kill();
    }
  }, 10000);
}

if (require.main === module) {
  const readiness = checkDeploymentReadiness();
  if (readiness && process.argv.includes('--test-startup')) {
    testServerStartup();
  }
}

module.exports = { checkDeploymentReadiness };
