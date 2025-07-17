#!/usr/bin/env node

const { execSync } = require('child_process');
const { existsSync, mkdirSync, writeFileSync, readFileSync, statSync } = require('fs');
const path = require('path');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}[${new Date().toISOString()}] ${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`Executing: ${description}`, 'info');
  try {
    execSync(command, { stdio: 'inherit', timeout: 300000 });
    log(`✅ ${description} completed successfully`, 'success');
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'error');
    throw error;
  }
}

function ensureDirectories() {
  const dirs = ['dist', 'dist/public'];
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      log(`Created directory: ${dir}`, 'info');
    }
  });
}

function buildServer() {
  log('🖥️ Building server with TypeScript compilation', 'info');

  // First, install server dependencies
  runCommand('cd server && npm install', 'Installing server dependencies');

  // Build with TypeScript compiler for better compatibility
  runCommand('cd server && npx tsc', 'Building server with TypeScript');

  // Copy the built files to main dist directory
  if (existsSync('server/dist/index.js')) {
    runCommand('cp -r server/dist/* dist/', 'Copying server build');
    log(`✅ Server bundle created successfully`, 'success');
  } else {
    // Fallback to esbuild
    const buildCommand = [
      'npx esbuild server/index.ts',
      '--bundle',
      '--platform=node',
      '--format=cjs',
      '--outfile=dist/index.js',
      '--external:express',
      '--external:cors',
      '--external:dotenv',
      '--external:helmet',
      '--external:multer',
      '--external:stripe',
      '--external:zod',
      '--external:nanoid',
      '--external:express-rate-limit',
      '--minify'
    ].join(' ');

    runCommand(buildCommand, 'Building server with esbuild fallback');
  }

  if (!existsSync('dist/index.js')) {
    throw new Error('Server bundle creation failed');
  }
}

function createProductionPackage() {
  log('📦 Creating production package.json', 'info');

  let currentPackage;
  try {
    currentPackage = JSON.parse(readFileSync('package.json', 'utf8'));
  } catch (error) {
    throw new Error('Cannot read package.json');
  }

  const prodPackage = {
    "name": "burnt-beats-production",
    "version": "1.0.0",
    "type": "commonjs",
    "engines": {
      "node": ">=18"
    },
    "scripts": {
      "start": "node index.js"
    },
    "dependencies": {
      "express": currentPackage.dependencies["express"] || "^4.21.2",
      "express-rate-limit": currentPackage.dependencies["express-rate-limit"] || "^7.5.1",
      "cors": currentPackage.dependencies["cors"] || "^2.8.5",
      "helmet": currentPackage.dependencies["helmet"] || "^8.1.0",
      "multer": currentPackage.dependencies["multer"] || "^2.0.1",
      "stripe": currentPackage.dependencies["stripe"] || "^18.3.0",
      "zod": currentPackage.dependencies["zod"] || "^3.24.2",
      "nanoid": currentPackage.dependencies["nanoid"] || "^5.1.5",
      "dotenv": currentPackage.dependencies["dotenv"] || "^17.0.1"
    }
  };

  writeFileSync(path.join('dist', 'package.json'), JSON.stringify(prodPackage, null, 2));
  log('✅ Production package.json created', 'success');
}

function buildClient() {
  log('🌐 Building client application', 'info');

  const clientHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Burnt Beats - AI Music Creation</title>
    <style>
        body { margin: 0; font-family: system-ui, sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d1b69 50%, #ff6b35 100%); color: white; min-height: 100vh; }
        .app { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .container { max-width: 600px; text-align: center; }
        .logo { width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(45deg, #ff6b35, #f7931e); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .btn { background: linear-gradient(45deg, #ff6b35, #f7931e); border: none; padding: 12px 24px; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; margin: 10px; text-decoration: none; display: inline-block; transition: transform 0.2s; }
        .btn:hover { transform: translateY(-2px); }
        .status { margin-top: 20px; padding: 15px; border-radius: 8px; background: rgba(255,255,255,0.1); }
    </style>
</head>
<body>
    <div class="app">
        <div class="container">
            <div class="logo">🔥</div>
            <h1>Burnt Beats</h1>
            <p>AI-Powered Music Creation Platform</p>
            <div>
                <a href="#" class="btn" onclick="testServer()">Test Server</a>
                <a href="#" class="btn" onclick="window.location.reload()">Refresh</a>
            </div>
            <div class="status">
                <p><strong>Server Status:</strong> <span id="status">Checking...</span></p>
                <p><small>Build: Production Ready</small></p>
            </div>
        </div>
    </div>
    <script>
        function checkServer() {
            fetch('/api/health')
                .then(r => r.json())
                .then(d => {
                    document.getElementById('status').textContent = d.status === 'healthy' ? 'Online ✅' : 'Issues ⚠️';
                })
                .catch(() => {
                    document.getElementById('status').textContent = 'Offline ❌';
                });
        }

        function testServer() {
            checkServer();
        }

        checkServer();
        setInterval(checkServer, 30000);
    </script>
</body>
</html>`;

  writeFileSync(path.join('dist', 'public', 'index.html'), clientHTML);
  log('✅ Client application built', 'success');
}

async function main() {
  const startTime = Date.now();

  try {
    console.log('='.repeat(50));
    log('🔥 Burnt Beats Production Build', 'info');
    console.log('='.repeat(50));

    ensureDirectories();
    buildServer();
    createProductionPackage();
    buildClient();

    const buildTime = Math.round((Date.now() - startTime) / 1000);
    log(`🎉 Build completed successfully in ${buildTime}s`, 'success');

  } catch (error) {
    const buildTime = Math.round((Date.now() - startTime) / 1000);
    log(`❌ Build failed after ${buildTime}s: ${error.message}`, 'error');
    process.exit(1);
  }
}

main();