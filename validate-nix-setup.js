
#!/usr/bin/env node

/**
 * Validate Nix Environment Setup for Burnt Beats
 */

const { execSync } = require('child_process');
const fs = require('fs');

function checkCommand(command, name) {
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${name}: ${result.trim()}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: Not found or error`);
    return false;
  }
}

function checkFile(path, name) {
  if (fs.existsSync(path)) {
    console.log(`✅ ${name}: Found`);
    return true;
  } else {
    console.log(`❌ ${name}: Missing`);
    return false;
  }
}

console.log('🔍 Validating Burnt Beats Environment Setup...\n');

// Check core runtime environments
console.log('📦 Core Runtimes:');
checkCommand('node --version', 'Node.js');
checkCommand('python --version', 'Python');
checkCommand('npm --version', 'NPM');

console.log('\n🛠️  Development Tools:');
checkCommand('git --version', 'Git');
checkCommand('which pkg-config', 'pkg-config');

console.log('\n🎵 Audio Libraries:');
checkCommand('which fluidsynth', 'FluidSynth');
checkCommand('which ffmpeg', 'FFmpeg');

console.log('\n📁 Project Files:');
checkFile('package.json', 'package.json');
checkFile('replit.nix', 'replit.nix');
checkFile('.replit', '.replit');
checkFile('server/index.ts', 'Server source');

console.log('\n🚀 Build Scripts:');
checkFile('deploy-production-fix.cjs', 'Production deploy script');
checkFile('quick-production-fix.cjs', 'Quick deploy script');

console.log('\n✨ Environment validation complete!');
