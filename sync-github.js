
const { execSync } = require('child_process');

function executeCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000,
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

function checkGitConfig() {
  console.log('🔧 Checking Git configuration...');
  
  const userName = executeCommand('git config --global user.name');
  const userEmail = executeCommand('git config --global user.email');
  
  if (!userName.success || !userName.output) {
    console.log('⚠️  Setting default Git user name...');
    executeCommand('git config --global user.name "Replit User"');
  }
  
  if (!userEmail.success || !userEmail.output) {
    console.log('⚠️  Setting default Git user email...');
    executeCommand('git config --global user.email "user@replit.com"');
  }
  
  // Set credential helper for Replit
  executeCommand('git config --global credential.helper store');
  console.log('✅ Git configuration verified');
}

function checkRemoteConnection() {
  console.log('🔗 Checking remote connection...');
  
  const remotes = executeCommand('git remote -v');
  if (!remotes.success) {
    console.error('❌ No Git remotes configured');
    return false;
  }
  
  console.log('📡 Remotes:', remotes.output);
  
  // Test connection to origin
  const fetchTest = executeCommand('git ls-remote origin HEAD', { timeout: 15000 });
  if (!fetchTest.success) {
    console.error('❌ Cannot connect to remote repository');
    console.error('This may be due to:');
    console.error('1. Authentication issues - make sure you\'ve connected GitHub in Replit');
    console.error('2. Network connectivity problems');
    console.error('3. Repository permissions');
    return false;
  }
  
  console.log('✅ Remote connection verified');
  return true;
}

function syncWithGitHub() {
  console.log('🔄 Starting GitHub sync...');
  
  // Check Git configuration first
  checkGitConfig();
  
  // Check remote connection
  if (!checkRemoteConnection()) {
    return false;
  }
  
  // Check current status
  const status = executeCommand('git status --porcelain');
  if (!status.success) {
    console.error('❌ Failed to check git status:', status.error);
    return false;
  }

  // Stage all changes if there are any
  if (status.output.length > 0) {
    console.log('📝 Staging changes...');
    const add = executeCommand('git add .');
    if (!add.success) {
      console.error('❌ Failed to stage changes:', add.error);
      return false;
    }
  }

  // Check if there are staged changes to commit
  const staged = executeCommand('git diff --cached --name-only');
  if (staged.success && staged.output.length > 0) {
    console.log('💾 Committing changes...');
    const timestamp = new Date().toISOString();
    const commit = executeCommand(`git commit -m "Auto-sync from Replit - ${timestamp}"`);
    if (!commit.success && !commit.error.includes('nothing to commit')) {
      console.error('❌ Failed to commit changes:', commit.error);
      return false;
    }
    console.log('✅ Changes committed');
  }

  // Get current branch
  const branch = executeCommand('git rev-parse --abbrev-ref HEAD');
  if (!branch.success) {
    console.error('❌ Failed to get current branch:', branch.error);
    return false;
  }

  const currentBranch = branch.output;
  console.log(`🌿 Current branch: ${currentBranch}`);

  // Fetch latest from origin
  console.log('📥 Fetching latest from GitHub...');
  const fetch = executeCommand('git fetch origin');
  if (!fetch.success) {
    console.error('❌ Failed to fetch from origin:', fetch.error);
    if (fetch.stderr.includes('Authentication failed')) {
      console.error('🔐 Authentication error. Please:');
      console.error('1. Go to the Version Control tab in Replit');
      console.error('2. Click "Connect to GitHub"');
      console.error('3. Authorize Replit to access your repositories');
    }
    return false;
  }

  // Check if remote branch exists
  const remoteBranch = executeCommand(`git rev-parse --verify origin/${currentBranch}`);
  if (!remoteBranch.success) {
    console.log(`📤 Remote branch origin/${currentBranch} doesn't exist, pushing new branch...`);
    const pushNew = executeCommand(`git push -u origin ${currentBranch}`);
    if (!pushNew.success) {
      console.error('❌ Failed to push new branch:', pushNew.error);
      return false;
    }
    console.log('✅ New branch pushed successfully');
    return true;
  }

  // Try to pull/rebase changes
  console.log('🔀 Syncing with remote...');
  const pull = executeCommand(`git pull origin ${currentBranch} --rebase`);
  if (!pull.success) {
    if (pull.error.includes('CONFLICT') || pull.stderr.includes('CONFLICT')) {
      console.log('⚠️  Merge conflicts detected. Attempting resolution...');
      
      // Get conflicted files
      const conflicts = executeCommand('git diff --name-only --diff-filter=U');
      if (conflicts.success && conflicts.output.length > 0) {
        console.log('🔧 Conflicted files:', conflicts.output);
        
        const conflictFiles = conflicts.output.split('\n').filter(f => f.trim());
        for (const file of conflictFiles) {
          // For certain files, prefer local version
          if (file.includes('package-lock.json') || 
              file.includes('.env') || 
              file.includes('node_modules') ||
              file.includes('dist/')) {
            console.log(`📝 Resolving ${file} with local version`);
            executeCommand(`git checkout --ours "${file}"`);
            executeCommand(`git add "${file}"`);
          }
        }
        
        // Try to continue rebase
        const continueRebase = executeCommand('git rebase --continue');
        if (!continueRebase.success) {
          console.error('❌ Could not automatically resolve conflicts');
          console.log('🛠️  Manual resolution required:');
          console.log('1. Edit conflicted files manually');
          console.log('2. Run: git add <resolved-files>');
          console.log('3. Run: git rebase --continue');
          console.log('4. Run this sync script again');
          return false;
        }
      } else {
        console.error('❌ Failed to pull changes:', pull.error);
        return false;
      }
    } else {
      console.error('❌ Failed to pull changes:', pull.error);
      return false;
    }
  }

  // Push changes
  console.log('🚀 Pushing to GitHub...');
  const push = executeCommand(`git push origin ${currentBranch}`);
  if (!push.success) {
    console.error('❌ Failed to push to GitHub:', push.error);
    if (push.stderr.includes('rejected')) {
      console.log('🔄 Push rejected, trying force push with lease...');
      const forcePush = executeCommand(`git push --force-with-lease origin ${currentBranch}`);
      if (!forcePush.success) {
        console.error('❌ Force push failed:', forcePush.error);
        return false;
      }
    } else {
      return false;
    }
  }

  console.log('✅ GitHub sync completed successfully!');
  return true;
}

// Run the sync
console.log('🚀 Starting GitHub synchronization...');
if (syncWithGitHub()) {
  console.log('🎉 All changes synced with GitHub repository');
  process.exit(0);
} else {
  console.log('❌ Sync failed - check the errors above and try again');
  console.log('\n📋 Common solutions:');
  console.log('1. Connect GitHub in Replit\'s Version Control tab');
  console.log('2. Check repository permissions');
  console.log('3. Resolve any merge conflicts manually');
  process.exit(1);
}
