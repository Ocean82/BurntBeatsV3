#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment readiness...\n');

const checks = [
  {
    name: 'Build script exists',
    check: () => fs.existsSync('deploy-production-fix.cjs'),
    requirement: 'deploy-production-fix.cjs must exist'
  },
  {
    name: 'Optimized build script exists', 
    check: () => fs.existsSync('deploy-size-optimized.cjs'),
    requirement: 'deploy-size-optimized.cjs must exist'
  },
  {
    name: 'Server bundle exists',
    check: () => fs.existsSync('dist/index.js'),
    requirement: 'dist/index.js must be built'
  },
  {
    name: 'Production package.json exists',
    check: () => fs.existsSync('dist/package.json'),
    requirement: 'dist/package.json must exist'
  },
  {
    name: 'Client application exists',
    check: () => fs.existsSync('dist/public/index.html'),
    requirement: 'dist/public/index.html must exist'
  },
  {
    name: 'Deployment config exists',
    check: () => fs.existsSync('replit-deploy.toml'),
    requirement: 'replit-deploy.toml must exist'
  },
  {
    name: 'Docker ignore file exists',
    check: () => fs.existsSync('.dockerignore'),
    requirement: '.dockerignore must exist'
  },
  {
    name: 'Dockerfile exists',
    check: () => fs.existsSync('Dockerfile'),
    requirement: 'Dockerfile must exist'
  }
];

let allPassed = true;

checks.forEach(({ name, check, requirement }) => {
  const passed = check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (!passed) {
    console.log(`   Required: ${requirement}`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('\n🎉 All deployment checks passed!');
  
  // Show file sizes
  console.log('\n📊 Build artifacts:');
  if (fs.existsSync('dist/index.js')) {
    const size = Math.round(fs.statSync('dist/index.js').size / 1024);
    console.log(`   Server bundle: ${size}KB`);
  }
  if (fs.existsSync('dist/package.json')) {
    const size = Math.round(fs.statSync('dist/package.json').size / 1024);
    console.log(`   Package file: ${size}KB`);
  }
  if (fs.existsSync('dist/public/index.html')) {
    const size = Math.round(fs.statSync('dist/public/index.html').size / 1024);
    console.log(`   Client app: ${size}KB`);
  }
  
  console.log('\n🚀 Ready for deployment with optimized size!');
} else {
  console.log('\n❌ Some deployment requirements are missing.');
  console.log('Run the build script first: node deploy-production-fix.cjs');
  process.exit(1);
}