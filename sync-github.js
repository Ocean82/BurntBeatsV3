
const { execSync } = require('child_process');

function executeCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      ...options 
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout ? error.stdout.trim() : ''
    };
  }
}

function syncWithGitHub() {
  console.log('🔄 Starting GitHub sync...');

  // Check current status
  const status = executeCommand('git status --porcelain');
  if (!status.success) {
    console.error('❌ Failed to check git status:', status.error);
    return false;
  }

  // Stage all changes
  if (status.output.length > 0) {
    console.log('📝 Staging changes...');
    const add = executeCommand('git add .');
    if (!add.success) {
      console.error('❌ Failed to stage changes:', add.error);
      return false;
    }
  }

  // Commit if there are staged changes
  const staged = executeCommand('git diff --cached --name-only');
  if (staged.success && staged.output.length > 0) {
    console.log('💾 Committing changes...');
    const commit = executeCommand('git commit -m "Sync: Auto-commit from Replit - resolve deployment and security configurations"');
    if (!commit.success && !commit.error.includes('nothing to commit')) {
      console.error('❌ Failed to commit changes:', commit.error);
      return false;
    }
  }

  // Fetch latest from origin
  console.log('📥 Fetching latest from GitHub...');
  const fetch = executeCommand('git fetch origin');
  if (!fetch.success) {
    console.error('❌ Failed to fetch from origin:', fetch.error);
    return false;
  }

  // Check current branch
  const branch = executeCommand('git rev-parse --abbrev-ref HEAD');
  if (!branch.success) {
    console.error('❌ Failed to get current branch:', branch.error);
    return false;
  }

  const currentBranch = branch.output;
  console.log(`🌿 Current branch: ${currentBranch}`);

  // Try to merge or rebase
  console.log('🔀 Syncing with remote...');
  const merge = executeCommand(`git pull origin ${currentBranch} --rebase`);
  if (!merge.success) {
    console.log('⚠️  Merge conflicts detected. Attempting automatic resolution...');
    
    // Try to resolve common conflicts
    const conflicts = executeCommand('git diff --name-only --diff-filter=U');
    if (conflicts.success && conflicts.output.length > 0) {
      console.log('🔧 Resolving conflicts in:', conflicts.output);
      
      // For common files, use local version
      const conflictFiles = conflicts.output.split('\n');
      for (const file of conflictFiles) {
        if (file.includes('package-lock.json') || file.includes('.env')) {
          executeCommand(`git checkout --ours "${file}"`);
          executeCommand(`git add "${file}"`);
        }
      }
      
      // Complete the merge
      const continueMerge = executeCommand('git rebase --continue');
      if (!continueMerge.success) {
        console.error('❌ Failed to resolve conflicts automatically');
        console.log('📋 Manual resolution required for remaining conflicts');
        return false;
      }
    }
  }

  // Push changes
  console.log('🚀 Pushing to GitHub...');
  const push = executeCommand(`git push origin ${currentBranch}`);
  if (!push.success) {
    console.error('❌ Failed to push to GitHub:', push.error);
    return false;
  }

  console.log('✅ GitHub sync completed successfully!');
  return true;
}

// Run the sync
if (syncWithGitHub()) {
  console.log('🎉 All changes synced with GitHub repository');
} else {
  console.log('❌ Sync failed - manual intervention may be required');
  process.exit(1);
}
