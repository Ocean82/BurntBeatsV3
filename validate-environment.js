
#!/usr/bin/env node

/**
 * Environment validation for Burnt Beats deployment
 * Checks all required environment variables and dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Burnt Beats - Environment Validation');
console.log('======================================');

let validationPassed = true;

// Check required files
const requiredFiles = [
  'package.json',
  'server/index.ts',
  'client/src/main.tsx',
  'deploy-production-fix.cjs'
];

console.log('\n📁 Checking required files...');
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    validationPassed = false;
  }
}

// Check environment variables
const requiredEnvVars = [
  'DATABASE_URL'
];

const optionalEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'OPENAI_API_KEY',
  'NODE_ENV',
  'PORT'
];

console.log('\n🔐 Checking environment variables...');
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} - SET`);
  } else {
    console.log(`❌ ${envVar} - MISSING (REQUIRED)`);
    validationPassed = false;
  }
}

console.log('\n🔧 Optional environment variables:');
for (const envVar of optionalEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} - SET`);
  } else {
    console.log(`⚠️ ${envVar} - NOT SET (optional)`);
  }
}

// Check Node.js version
console.log('\n🟢 Node.js version check...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
  console.log(`✅ Node.js ${nodeVersion} (>= 18.0.0)`);
} else {
  console.log(`❌ Node.js ${nodeVersion} (requires >= 18.0.0)`);
  validationPassed = false;
}

// Check package.json dependencies
console.log('\n📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const criticalDeps = [
    'express',
    'drizzle-orm',
    'react',
    'vite',
    'typescript'
  ];
  
  for (const dep of criticalDeps) {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      validationPassed = false;
    }
  }
} catch (error) {
  console.log('❌ Failed to read package.json:', error.message);
  validationPassed = false;
}

// Final result
console.log('\n' + '='.repeat(40));
if (validationPassed) {
  console.log('✅ Environment validation PASSED');
  console.log('🚀 Ready for deployment!');
  process.exit(0);
} else {
  console.log('❌ Environment validation FAILED');
  console.log('💡 Please fix the issues above before deploying');
  process.exit(1);
}
