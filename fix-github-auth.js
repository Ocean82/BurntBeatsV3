
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
      stderr: error.stderr ? error.stderr.trim() : ''
    };
  }
}

console.log('🔧 GitHub Authentication Fix for Replit\n');

// Check if we're in a git repo
const isRepo = runCommand('git status');
if (!isRepo.success) {
  console.log('❌ Not in a Git repository. Initializing...');
  runCommand('git init');
  console.log('✅ Git repository initialized');
}

// Configure Git with safe defaults
console.log('🔧 Configuring Git...');
runCommand('git config --global user.name "Replit User"');
runCommand('git config --global user.email "user@replit.com"');
runCommand('git config --global credential.helper store');
runCommand('git config --global init.defaultBranch main');
runCommand('git config --global pull.rebase true');

// Check remote
const remotes = runCommand('git remote -v');
if (!remotes.success || !remotes.output) {
  console.log('⚠️  No remote repository configured.');
  console.log('Please add your GitHub repository:');
  console.log('git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git');
} else {
  console.log('🔗 Current remotes:');
  console.log(remotes.output);
}

// Test connection
console.log('\n🧪 Testing GitHub connection...');
const testConnection = runCommand('git ls-remote origin HEAD');

if (!testConnection.success) {
  console.log('❌ GitHub connection failed');
  console.log('\n🔐 To fix authentication:');
  console.log('1. In Replit, click the lock icon (🔒) in the top toolbar');
  console.log('2. Click "Connect to GitHub"');
  console.log('3. Authorize Replit to access your repositories');
  console.log('4. Make sure this repository is accessible');
  console.log('\n🔄 After connecting, run: node sync-github.js');
} else {
  console.log('✅ GitHub connection successful!');
  console.log('🚀 You can now run: node sync-github.js');
}
