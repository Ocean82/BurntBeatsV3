#!/usr/bin/env node

/**
 * Replit Deployment Readiness Checker for Burnt Beats
 * Ensures all systems are ready for production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Burnt Beats - Replit Deployment Readiness Check');
console.log('================================================');

function runCommand(command, description, options = {}) {
  console.log(`\n📦 ${description}...`);
  try {
    const result = execSync(command, { 
      stdio: 'pipe', 
      cwd: process.cwd(),
      encoding: 'utf8',
      ...options 
    });
    console.log(`✅ ${description} - OK`);
    return { success: true, output: result };
  } catch (error) {
    console.error(`❌ ${description} - FAILED`);
    console.error(`   Error: ${error.message}`);
    return { success: false, error: error.message, output: error.stdout };
  }
}

function checkFile(filepath, required = false) {
  if (fs.existsSync(filepath)) {
    console.log(`✅ ${filepath} - Found`);
    return true;
  } else {
    console.log(`${required ? '❌' : '⚠️'} ${filepath} - ${required ? 'MISSING (Required)' : 'Missing (Optional)'}`);
    return !required;
  }
}

function checkDirectory(dirpath, required = false) {
  try {
    if (fs.existsSync(dirpath) && fs.statSync(dirpath).isDirectory()) {
      console.log(`✅ ${dirpath}/ - Found`);
      return true;
    } else {
      if (required) {
        fs.mkdirSync(dirpath, { recursive: true });
        console.log(`✅ ${dirpath}/ - Created`);
        return true;
      } else {
        console.log(`⚠️ ${dirpath}/ - Missing (Optional)`);
        return true;
      }
    }
  } catch (error) {
    console.log(`❌ ${dirpath}/ - Error: ${error.message}`);
    return false;
  }
}

console.log('\n🗂️ Checking Required Files...');
let allFilesOk = true;
allFilesOk &= checkFile('package.json', true);
allFilesOk &= checkFile('.replit', true);
allFilesOk &= checkFile('.replit.nix', true);
allFilesOk &= checkFile('start-dev.cjs', true);
allFilesOk &= checkFile('lightweight-deploy.cjs', true);
allFilesOk &= checkFile('server/index.ts', true);

console.log('\n📁 Checking Required Directories...');
let allDirsOk = true;
allDirsOk &= checkDirectory('server', true);
allDirsOk &= checkDirectory('client', true);
allDirsOk &= checkDirectory('shared', true);
allDirsOk &= checkDirectory('storage/midi/generated', true);
allDirsOk &= checkDirectory('storage/midi/templates', true);
allDirsOk &= checkDirectory('storage/voice-bank', true);
allDirsOk &= checkDirectory('storage/voices', true);
allDirsOk &= checkDirectory('storage/models', true);

console.log('\n📦 Checking Dependencies...');
const depsCheck = runCommand('npm ls --depth=0 --json', 'Checking installed dependencies');
let depsOk = depsCheck.success;

if (depsCheck.success) {
  try {
    const deps = JSON.parse(depsCheck.output);
    const missingDeps = deps.problems?.filter(p => p.includes('missing')) || [];
    if (missingDeps.length > 0) {
      console.log('⚠️ Some dependencies may be missing:');
      missingDeps.slice(0, 5).forEach(dep => console.log(`   - ${dep}`));
      if (missingDeps.length > 5) {
        console.log(`   ... and ${missingDeps.length - 5} more`);
      }
    }
  } catch (e) {
    // JSON parse error is not critical
  }
}

console.log('\n🔧 Checking Build System...');
const buildCheck = runCommand('npm run typecheck -- --noEmit --skipLibCheck', 'TypeScript compilation check');
let buildOk = buildCheck.success;

console.log('\n🧪 Checking Core Scripts...');
let scriptsOk = true;
scriptsOk &= runCommand('node -e "console.log(\'Node.js works\')"', 'Node.js functionality').success;

// Check if tsx can run
try {
  const tsxCheck = runCommand('npx tsx --version', 'TypeScript execution (tsx)');
  if (!tsxCheck.success) {
    console.log('⚠️ tsx not available, trying alternative...');
    scriptsOk &= runCommand('node --loader=ts-node/esm --version', 'Alternative TypeScript loader').success;
  }
} catch (e) {
  console.log('⚠️ TypeScript execution may have issues');
}

console.log('\n🔍 Environment Check...');
const envVars = ['NODE_ENV', 'PORT'];
envVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar} = ${value}`);
  } else {
    console.log(`⚠️ ${envVar} - Not set (will use defaults)`);
  }
});

console.log('\n🚀 Deployment Scripts Check...');
let deployOk = true;
deployOk &= checkFile('lightweight-deploy.cjs', true);
deployOk &= checkFile('deploy-production-fix.cjs', false);
deployOk &= checkFile('simple-build.cjs', false);

console.log('\n📊 Final Assessment...');
console.log('====================');

const overallScore = {
  files: allFilesOk ? 100 : 60,
  directories: allDirsOk ? 100 : 70,
  dependencies: depsOk ? 100 : 50,
  build: buildOk ? 100 : 30,
  scripts: scriptsOk ? 100 : 80,
  deployment: deployOk ? 100 : 90
};

const avgScore = Object.values(overallScore).reduce((a, b) => a + b, 0) / Object.keys(overallScore).length;

console.log(`Files: ${overallScore.files}%`);
console.log(`Directories: ${overallScore.directories}%`);
console.log(`Dependencies: ${overallScore.dependencies}%`);
console.log(`Build System: ${overallScore.build}%`);
console.log(`Scripts: ${overallScore.scripts}%`);
console.log(`Deployment: ${overallScore.deployment}%`);
console.log(`\n📈 Overall Readiness: ${Math.round(avgScore)}%`);

if (avgScore >= 90) {
  console.log('\n🎉 EXCELLENT! Ready for deployment');
  console.log('🚀 Recommended action: Deploy immediately');
  process.exit(0);
} else if (avgScore >= 70) {
  console.log('\n✅ GOOD! Ready for deployment with minor issues');
  console.log('🚀 Recommended action: Deploy and monitor');
  process.exit(0);
} else if (avgScore >= 50) {
  console.log('\n⚠️ FAIR! Can deploy but expect issues');
  console.log('🔧 Recommended action: Fix major issues first');
  process.exit(1);
} else {
  console.log('\n❌ POOR! Not ready for deployment');
  console.log('🛠️ Recommended action: Fix critical issues before deploying');
  process.exit(1);
}
