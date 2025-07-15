#!/usr/bin/env node

// Production server start script for Replit deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Enhanced logging with colors and timestamps
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m'
  };
  const timestamp = new Date().toISOString();
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

// Configuration
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

log('Starting Burnt Beats production server...', 'info');

// Ensure production build exists
const serverBuildPath = path.join('dist', 'index.cjs');
const uploadsDir = path.join('dist', 'uploads');

try {
  if (!fs.existsSync(serverBuildPath)) {
    log('Building server bundle...', 'info');

    const buildCommand = [
      'npx esbuild server/index.ts',
      '--bundle',
      '--platform=node',
      '--target=node20',
      '--format=cjs',
      '--outfile=dist/index.cjs',
      '--external:pg-native',
      '--external:bufferutil',
      '--external:utf-8-validate',
      '--external:fsevents',
      '--minify'
    ].join(' ');

    execSync(buildCommand, { 
      stdio: 'inherit',
      timeout: 120000 // 2 minute timeout
    });
  }

  // Ensure directories exist
  if (!fs.existsSync(uploadsDir)) {
    log('Creating uploads directory...', 'info');
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Verify build integrity
  if (!fs.existsSync(serverBuildPath)) {
    throw new Error('Server build failed - dist/index.cjs not found');
  }

  log('Starting server process...', 'info');
  log(`Server will be available at http://0.0.0.0:${process.env.PORT || 5000}`, 'success');

  // Start the server with error handling
  try {
    // Change to dist directory and start server
    process.chdir('dist');
    require('./index.cjs');
  } catch (err) {
    log(`Server crashed: ${err.message}`, 'error');
    log('Stack trace:', 'error');
    console.error(err.stack);
    process.exit(1);
  }

} catch (err) {
  log(`❌ Deployment failed: ${err.message}`, 'error');
  if (err.stderr) {
    log('Error details:', 'error');
    console.error(err.stderr.toString());
  }
  process.exit(1);
}

// Handle process termination gracefully
process.on('SIGTERM', () => {
  log('Received SIGTERM - shutting down gracefully', 'warn');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('Received SIGINT - shutting down gracefully', 'warn');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  log(`Uncaught Exception: ${err.message}`, 'error');
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}`, 'error');
  console.error('Reason:', reason);
  process.exit(1);
});
#!/usr/bin/env node

/**
 * Production server starter for Burnt Beats
 * Handles server initialization and health checks
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🎵 Burnt Beats - Production Server Starter');
console.log('==========================================');

// Check if production build exists
const serverPath = path.join(__dirname, 'dist', 'index.cjs');
if (!fs.existsSync(serverPath)) {
  console.error('❌ Production build not found at:', serverPath);
  console.log('💡 Run the build first: node deploy-production-fix.cjs');
  process.exit(1);
}

// Start the server
console.log('🚀 Starting production server...');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'dist'),
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '5000'
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
  console.log('👋 Server stopped');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
});
