#!/usr/bin/env node

/**
 * Cleanup Unused Assets Script for Burnt Beats
 * Removes large files and directories that are not needed for production
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Burnt Beats - Cleanup Unused Assets');
console.log('=====================================');

// Directories and files to remove (not needed for production)
const itemsToRemove = [
  // Large unused directories
  'attached_assets',
  'Retrieval-based-Voice-Conversion-WebUI',
  'SDIO_1.12.9.749 (1)',
  'backend-repl',
  'frontend-repl',
  'music Gen extra',
  'Branding Voice Guide',
  'Business Summary',
  'Project HQ',
  
  // Unused documentation files (keeping essential ones)
  'BUTTON_FIXES_SUMMARY.md',
  'CI_CD_COMPLETION_REPORT.md',
  'CI_CD_SETUP.md',
  'DEPLOYMENT_INSTRUCTIONS.md',
  'DEPLOYMENT_STATUS.md',
  'DEVELOPMENT_CHECKLIST.md',
  'DUAL_REPL_SETUP.md',
  'GITIGNORE_CLEANUP_REPORT.md',
  'PRODUCTION_COMPLETE.md',
  'SONG_CREATION_DEMO.md',
  'backend-compatibility-summary.md',
  'frontend-feature-analysis.md',
  'frontend-implementation-status.md',
  
  // Unused build/deploy scripts (keeping essential ones)
  'build-client.js',
  'build-react-properly.cjs',
  'build-server.js',
  'build.js',
  'chmod',
  'cleanup-for-deployment.sh',
  'deploy-production-fix.cjs',
  'deploy-size-optimized.cjs',
  'deploy.js',
  'deploy.sh',
  'final-deployment-solution.cjs',
  'fix-deployment.js',
  'fix-github-auth.js',
  'health-check-deployment.js',
  'health-check.js',
  'install-production-deps.sh',
  'quick-deploy.js',
  'quick-production-fix.cjs',
  'quick-start.js',
  'run-production.js',
  'run-ui-test.js',
  'safe-deploy.cjs',
  'simple-build.js',
  'simple-server.js',
  'start-app.sh',
  'start-production.js',
  'start-server.js',
  'start-with-nix.sh',
  'start.sh',
  'sync-github.js',
  'validate-environment.js',
  'validate-nix-setup.js',
  'verify-deployment-ready.js',
  
  // Unused Python files
  'client_example.py',
  'main.py',
  'music_service.py',
  'setup_rvc_env.py',
  'voice_service.py',
  
  // Unused config files
  'app.yaml',
  'pyproject.toml',
  'uv.lock',
  'replit.md',
  'replit.nix',
  'replit.toml',
  'replit-deploy.toml',
  
  // Test files that are not needed
  'test-auth.js',
  'test-build.cjs',
  'test-button-functionality.js',
  'test-file.txt',
  'test-git-setup.js',
  'test-integrations.js',
  'test-midi-templates.py',
  'test-report.json',
  'test-stripe-payment.js',
  'test-ui-interactions.html',
  
  // Unused utility files
  'package-scripts.js',
  'security-audit-report.json',
  'security-audit.js',
  'stripe-health-check.js',
  
  // Generated files that can be recreated
  'generated-icon.png',
  'git log --pretty-format',
  
  // Unused development files
  'start-dev.js',
  'production-readiness-check.js'
];

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    try {
      const stats = fs.statSync(currentPath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        files.forEach(file => {
          calculateSize(path.join(currentPath, file));
        });
      } else {
        totalSize += stats.size;
      }
    } catch (error) {
      // Ignore errors (permission issues, etc.)
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeItem(itemPath) {
  try {
    if (!fs.existsSync(itemPath)) {
      console.log(`⚠️  ${itemPath} - Not found (already removed)`);
      return 0;
    }
    
    const stats = fs.statSync(itemPath);
    let size = 0;
    
    if (stats.isDirectory()) {
      size = getDirectorySize(itemPath);
      fs.rmSync(itemPath, { recursive: true, force: true });
      console.log(`🗂️  Removed directory: ${itemPath} (${formatBytes(size)})`);
    } else {
      size = stats.size;
      fs.unlinkSync(itemPath);
      console.log(`📄 Removed file: ${itemPath} (${formatBytes(size)})`);
    }
    
    return size;
  } catch (error) {
    console.error(`❌ Failed to remove ${itemPath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log('\n🔍 Scanning for unused assets...\n');
  
  let totalSaved = 0;
  let removedCount = 0;
  
  itemsToRemove.forEach(item => {
    const itemPath = path.join(process.cwd(), item);
    const savedBytes = removeItem(itemPath);
    if (savedBytes > 0) {
      totalSaved += savedBytes;
      removedCount++;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 CLEANUP COMPLETE!');
  console.log('='.repeat(50));
  console.log(`📊 Items removed: ${removedCount}`);
  console.log(`💾 Space saved: ${formatBytes(totalSaved)}`);
  
  if (totalSaved > 0) {
    console.log('\n✅ Benefits:');
    console.log('   • Faster deployments');
    console.log('   • Reduced storage costs');
    console.log('   • Cleaner project structure');
    console.log('   • Faster git operations');
  }
  
  console.log('\n🚀 Your project is now optimized for production!');
  
  // Show remaining essential files
  console.log('\n📋 Essential files kept:');
  const essentialFiles = [
    'package.json',
    'README.md',
    'PRODUCTION_READINESS_REPORT.md',
    'REPLIT_DEPLOYMENT_GUIDE.md',
    'server/',
    'client/',
    'shared/',
    'storage/',
    'dist/',
    'node_modules/'
  ];
  
  essentialFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    }
  });
}

main();
