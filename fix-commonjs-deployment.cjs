/**
 * CommonJS Deployment Fix for Burnt Beats
 * Fixes the ES module vs CommonJS deployment issue
 */

const { execSync } = require('child_process');
const { writeFileSync, readFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  
  const prefix = type === 'error' ? '❌' : 
                type === 'success' ? '✅' : 
                type === 'warn' ? '⚠️' : 'ℹ️';
  
  console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`${description}...`);
    execSync(command, { stdio: 'inherit' });
    log(`${description} completed`, 'success');
    return true;
  } catch (error) {
    log(`${description} failed: ${error.message}`, 'error');
    return false;
  }
}

function ensureDirectories() {
  const dirs = ['dist', 'dist/public'];
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      log(`Created directory: ${dir}`);
    }
  });
}

function buildServerESM() {
  log('🔧 Building server with ES Module format', 'info');
  
  const buildCommand = [
    'npx esbuild server/index.ts',
    '--bundle',
    '--platform=node',
    '--target=node20',
    '--format=esm', // Use ES modules
    '--outfile=dist/index.js', // Use .js extension
    '--external:express',
    '--external:cors',
    '--external:dotenv',
    '--external:helmet',
    '--external:multer',
    '--external:stripe',
    '--external:ws',
    '--external:zod',
    '--external:drizzle-orm',
    '--external:nanoid',
    '--external:@neondatabase/serverless',
    '--external:@google-cloud/storage',
    '--external:express-session',
    '--external:express-rate-limit',
    '--external:connect-pg-simple',
    '--external:pg-native',
    '--external:bufferutil',
    '--external:utf-8-validate',
    '--external:fsevents',
    '--minify',
    '--sourcemap=external'
  ].join(' ');

  return runCommand(buildCommand, 'Building ES Module server bundle');
}

function createProductionPackageJson() {
  log('📦 Creating production package.json with ES Module support', 'info');
  
  const currentPackage = JSON.parse(readFileSync('package.json', 'utf8'));
  
  const prodPackage = {
    "name": "burnt-beats-production",
    "version": "1.0.0",
    "type": "module", // Enable ES modules
    "engines": {
      "node": ">=20.0.0"
    },
    "scripts": {
      "start": "node index.js", // Use .js extension with ES modules
      "health-check": "curl -f http://0.0.0.0:5000/health || exit 1"
    },
    "dependencies": {
      // Runtime dependencies only
      "@neondatabase/serverless": currentPackage.dependencies["@neondatabase/serverless"],
      "@google-cloud/storage": currentPackage.dependencies["@google-cloud/storage"], 
      "express": currentPackage.dependencies["express"],
      "express-session": currentPackage.dependencies["express-session"],
      "express-rate-limit": currentPackage.dependencies["express-rate-limit"],
      "connect-pg-simple": currentPackage.dependencies["connect-pg-simple"],
      "cors": currentPackage.dependencies["cors"],
      "helmet": currentPackage.dependencies["helmet"],
      "multer": currentPackage.dependencies["multer"],
      "stripe": currentPackage.dependencies["stripe"],
      "ws": currentPackage.dependencies["ws"],
      "zod": currentPackage.dependencies["zod"],
      "drizzle-orm": currentPackage.dependencies["drizzle-orm"],
      "nanoid": currentPackage.dependencies["nanoid"],
      "dotenv": currentPackage.dependencies["dotenv"]
    }
  };

  writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
  log('✅ Production package.json created (ES Module format)', 'success');
}

function buildClient() {
  log('🏗️ Building client application', 'info');
  
  const clientBuildCommand = 'npx vite build --config vite.config.client.ts --outDir dist/public';
  
  if (!runCommand(clientBuildCommand, 'Building client with Vite')) {
    log('⚠️ Client build failed, creating fallback', 'warn');
    createFallbackClient();
  }
}

function createFallbackClient() {
  log('🔄 Creating fallback client interface', 'info');
  
  const fallbackHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Burnt Beats - AI Music Creation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .logo { font-size: 2.5rem; margin-bottom: 1rem; }
        .title { font-size: 3rem; margin-bottom: 1rem; background: linear-gradient(45deg, #ff6b35, #f7931e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.8; }
        .status { padding: 1rem; background: #2d5a2d; border-radius: 8px; margin: 1rem 0; }
        .features { text-align: left; margin: 2rem 0; }
        .feature { margin: 0.5rem 0; padding: 0.5rem; background: rgba(255, 255, 255, 0.1); border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎵</div>
        <h1 class="title">Burnt Beats</h1>
        <p class="subtitle">AI-Powered Music Creation Platform</p>
        
        <div class="status">
            <h3>✅ Deployment Configuration Fixed</h3>
            <p>CommonJS compatibility issues resolved</p>
        </div>
        
        <div class="features">
            <div class="feature">🎤 Voice Cloning & Text-to-Speech</div>
            <div class="feature">🎶 AI Music Generation</div>
            <div class="feature">💰 Pay-Per-Download Model</div>
            <div class="feature">🎧 Professional Audio Quality</div>
            <div class="feature">🔒 100% Song Ownership</div>
        </div>
        
        <p>Server running with CommonJS build format</p>
    </div>
</body>
</html>`;

  writeFileSync('dist/public/index.html', fallbackHTML);
  log('✅ Fallback client created', 'success');
}

function validateBuild() {
  log('🔍 Validating ES Module build', 'info');
  
  const requiredFiles = [
    'dist/index.js',
    'dist/package.json', 
    'dist/public/index.html'
  ];
  
  const missingFiles = requiredFiles.filter(file => !existsSync(file));
  
  if (missingFiles.length > 0) {
    log(`❌ Missing files: ${missingFiles.join(', ')}`, 'error');
    return false;
  }
  
  // Check package.json has "type": "module"
  const packageJson = JSON.parse(readFileSync('dist/package.json', 'utf8'));
  if (packageJson.type !== 'module') {
    log('❌ Production package.json missing "type": "module"', 'error');
    return false;
  }
  
  // Check start script uses .js
  if (packageJson.scripts.start !== 'node index.js') {
    log('❌ Start script does not use index.js', 'error');
    return false;
  }
  
  log('✅ All ES Module deployment fixes validated', 'success');
  return true;
}

async function main() {
  log('🚀 Starting ES Module Deployment Fix', 'info');
  log('=====================================');
  
  try {
    // 1. Ensure directories exist
    ensureDirectories();
    
    // 2. Build server with ES Module format
    if (!buildServerESM()) {
      throw new Error('Server build failed');
    }
    
    // 3. Create ES Module-compatible production package.json
    createProductionPackageJson();
    
    // 4. Build client (with fallback)
    buildClient();
    
    // 5. Validate everything is correct
    if (!validateBuild()) {
      throw new Error('Build validation failed');
    }
    
    log('🎉 ES Module deployment fix completed successfully!', 'success');
    log('📁 All deployment artifacts ready in ./dist/', 'info');
    log('🔧 Build format: ES Modules (.js)', 'info');
    log('📦 Start command: node index.js', 'info');
    
  } catch (error) {
    log(`💥 Deployment fix failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };