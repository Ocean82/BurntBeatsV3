
const { execSync } = require('child_process');

function executeCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60000,
      ...options 
    });
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

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function initializeGitIfNeeded() {
  const isRepo = executeCommand('git rev-parse --is-inside-work-tree');
  if (!isRepo.success) {
    log('🔧 Initializing Git repository...', 'warning');
    executeCommand('git init');
    return true;
  }
  return false;
}

function configureGit() {
  log('🔧 Configuring Git...', 'info');
  
  const userName = executeCommand('git config --global user.name');
  const userEmail = executeCommand('git config --global user.email');
  
  if (!userName.success || !userName.output) {
    log('Setting Git user name...', 'warning');
    executeCommand('git config --global user.name "Replit User"');
  }
  
  if (!userEmail.success || !userEmail.output) {
    log('Setting Git user email...', 'warning');
    executeCommand('git config --global user.email "user@replit.com"');
  }
  
  // Configure Git for Replit
  executeCommand('git config --global credential.helper store');
  executeCommand('git config --global init.defaultBranch main');
  executeCommand('git config --global pull.rebase true');
  executeCommand('git config --global push.default simple');
  
  log('✅ Git configuration completed', 'success');
}

function addRemoteIfMissing() {
  const remotes = executeCommand('git remote');
  
  if (!remotes.success || !remotes.output.includes('origin')) {
    log('⚠️  No origin remote found. Please add your GitHub repository URL manually:', 'warning');
    log('Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git', 'warning');
    log('Then run this sync script again.', 'warning');
    return false;
  }
  
  const remoteUrl = executeCommand('git remote get-url origin');
  if (remoteUrl.success) {
    log(`🔗 Remote origin: ${remoteUrl.output}`, 'info');
  }
  
  return true;
}

function stageAndCommitChanges() {
  // Check for changes
  const status = executeCommand('git status --porcelain');
  if (!status.success) {
    log('❌ Failed to check git status', 'error');
    return false;
  }

  if (status.output.length === 0) {
    log('📋 No changes to commit', 'info');
    return true;
  }

  log('📝 Staging changes...', 'info');
  log(`Changes detected:\n${status.output}`, 'info');
  
  // Stage all changes
  const add = executeCommand('git add .');
  if (!add.success) {
    log(`❌ Failed to stage changes: ${add.error}`, 'error');
    return false;
  }

  // Create commit
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const commitMessage = `Auto-sync from Replit - ${timestamp}`;
  
  const commit = executeCommand(`git commit -m "${commitMessage}"`);
  if (!commit.success && !commit.error.includes('nothing to commit')) {
    log(`❌ Failed to commit: ${commit.error}`, 'error');
    return false;
  }
  
  if (commit.success) {
    log('✅ Changes committed successfully', 'success');
  }
  
  return true;
}

function getCurrentBranch() {
  const branch = executeCommand('git rev-parse --abbrev-ref HEAD');
  if (branch.success) {
    return branch.output;
  }
  return 'main';
}

function fetchFromRemote(branch) {
  log('📥 Fetching from remote...', 'info');
  
  const fetch = executeCommand('git fetch origin', { timeout: 120000 });
  if (!fetch.success) {
    log(`❌ Fetch failed: ${fetch.error}`, 'error');
    
    if (fetch.stderr.includes('Authentication failed') || fetch.stderr.includes('Permission denied')) {
      log('🔐 Authentication Error Detected!', 'error');
      log('Please connect GitHub to Replit:', 'warning');
      log('1. Open the Shell tab in Replit', 'warning');
      log('2. Click the lock icon (🔒) in the top toolbar', 'warning');
      log('3. Connect to GitHub and authorize Replit', 'warning');
      log('4. Make sure to grant access to this repository', 'warning');
      return false;
    }
    
    return false;
  }
  
  log('✅ Fetch completed', 'success');
  return true;
}

function pushToRemote(branch) {
  log(`🚀 Pushing to origin/${branch}...`, 'info');
  
  // First try regular push
  const push = executeCommand(`git push origin ${branch}`, { timeout: 120000 });
  
  if (push.success) {
    log('✅ Push successful!', 'success');
    return true;
  }
  
  // Handle different push failures
  if (push.stderr.includes('rejected') || push.stderr.includes('non-fast-forward')) {
    log('⚠️  Push rejected, trying to resolve...', 'warning');
    
    // Try pull with rebase first
    const pullRebase = executeCommand(`git pull origin ${branch} --rebase`);
    if (pullRebase.success) {
      log('✅ Successfully rebased with remote changes', 'success');
      
      // Try push again
      const retryPush = executeCommand(`git push origin ${branch}`);
      if (retryPush.success) {
        log('✅ Push successful after rebase!', 'success');
        return true;
      }
    }
    
    // If rebase fails, try force push with lease as last resort
    log('⚠️  Attempting force push with lease...', 'warning');
    const forcePush = executeCommand(`git push --force-with-lease origin ${branch}`);
    if (forcePush.success) {
      log('✅ Force push successful!', 'success');
      return true;
    }
  }
  
  if (push.stderr.includes('upstream') || push.stderr.includes('set-upstream')) {
    log(`🔗 Setting upstream for branch ${branch}...`, 'info');
    const upstreamPush = executeCommand(`git push -u origin ${branch}`);
    if (upstreamPush.success) {
      log('✅ Upstream set and push successful!', 'success');
      return true;
    }
  }
  
  log(`❌ Push failed: ${push.error}`, 'error');
  log(`STDERR: ${push.stderr}`, 'error');
  return false;
}

function syncWithGitHub() {
  log('🚀 Starting Enhanced GitHub Sync...', 'info');
  log('=' * 50, 'info');
  
  // Step 1: Initialize or verify git repo
  const wasInitialized = initializeGitIfNeeded();
  
  // Step 2: Configure Git
  configureGit();
  
  // Step 3: Check/add remote
  if (!addRemoteIfMissing()) {
    return false;
  }
  
  // Step 4: Get current branch
  const currentBranch = getCurrentBranch();
  log(`🌿 Working on branch: ${currentBranch}`, 'info');
  
  // Step 5: Stage and commit changes
  if (!stageAndCommitChanges()) {
    return false;
  }
  
  // Step 6: Fetch from remote
  if (!fetchFromRemote(currentBranch)) {
    return false;
  }
  
  // Step 7: Push to remote
  if (!pushToRemote(currentBranch)) {
    return false;
  }
  
  log('=' * 50, 'success');
  log('🎉 GitHub sync completed successfully!', 'success');
  log(`📊 Repository synchronized on branch: ${currentBranch}`, 'success');
  
  return true;
}

function showTroubleshootingHelp() {
  log('\n🔧 Troubleshooting Tips:', 'warning');
  log('1. Make sure you have connected GitHub in Replit', 'info');
  log('2. Verify repository permissions in GitHub', 'info');
  log('3. Check if the repository exists and you have write access', 'info');
  log('4. Try refreshing your Replit connection to GitHub', 'info');
  log('5. Make sure the remote URL is correct', 'info');
  log('\n🔗 To connect GitHub in Replit:', 'warning');
  log('• Click the lock icon (🔒) in the Replit toolbar', 'info');
  log('• Select "Connect to GitHub"', 'info');
  log('• Authorize Replit to access your repositories', 'info');
}

// Main execution
if (require.main === module) {
  try {
    const success = syncWithGitHub();
    
    if (!success) {
      showTroubleshootingHelp();
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    log(`💥 Unexpected error: ${error.message}`, 'error');
    showTroubleshootingHelp();
    process.exit(1);
  }
}

module.exports = { syncWithGitHub, executeCommand };
