
#!/usr/bin/env node

const { execSync } = require('child_process');

function runCommand(cmd) {
  try {
    const result = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout ? error.stdout.trim() : '',
      stderr: error.stderr ? error.stderr.trim() : ''
    };
  }
}

console.log('🔍 Git Setup Diagnostic\n');

// Check Git installation
console.log('1. Checking Git installation...');
const gitVersion = runCommand('git --version');
if (gitVersion.success) {
  console.log('✅ Git installed:', gitVersion.output);
} else {
  console.log('❌ Git not found');
  process.exit(1);
}

// Check Git configuration
console.log('\n2. Checking Git configuration...');
const userName = runCommand('git config --global user.name');
const userEmail = runCommand('git config --global user.email');

console.log('📧 User name:', userName.success ? userName.output : 'Not set');
console.log('📧 User email:', userEmail.success ? userEmail.output : 'Not set');

// Check repository status
console.log('\n3. Checking repository status...');
const isRepo = runCommand('git rev-parse --is-inside-work-tree');
if (isRepo.success) {
  console.log('✅ Inside Git repository');
  
  // Check remotes
  const remotes = runCommand('git remote -v');
  if (remotes.success && remotes.output) {
    console.log('🔗 Remotes configured:');
    console.log(remotes.output);
  } else {
    console.log('⚠️  No remotes configured');
  }
  
  // Check current branch
  const branch = runCommand('git rev-parse --abbrev-ref HEAD');
  if (branch.success) {
    console.log('🌿 Current branch:', branch.output);
  }
  
  // Check status
  const status = runCommand('git status --porcelain');
  if (status.success) {
    if (status.output) {
      console.log('📝 Uncommitted changes detected');
    } else {
      console.log('✅ Working directory clean');
    }
  }
} else {
  console.log('❌ Not inside a Git repository');
}

// Test remote connection
console.log('\n4. Testing remote connection...');
const remoteTest = runCommand('git ls-remote origin HEAD');
if (remoteTest.success) {
  console.log('✅ Remote connection successful');
} else {
  console.log('❌ Remote connection failed');
  console.log('Error:', remoteTest.stderr || remoteTest.error);
  console.log('\n🔧 Possible solutions:');
  console.log('1. Connect GitHub in Replit Version Control tab');
  console.log('2. Check repository permissions');
  console.log('3. Verify repository URL is correct');
}

console.log('\n🏁 Diagnostic complete');
