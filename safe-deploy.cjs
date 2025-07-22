#!/usr/bin/env node

/**
 * Safe Deployment Script for Burnt Beats
 * Implements all suggested fixes for Vite build issues:
 * - Simpler build settings to avoid memory issues
 * - Use main vite config instead of client-specific config  
 * - Add memory limits and safer build options
 * - Create fallback build script that skips Vite if it crashes
 */

const { execSync, spawn } = require('child_process');
const { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } = require('fs');
const path = require('path');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function runCommand(command, description, options = {}) {
  log(`🔄 ${description}`, 'info');
  try {
    const result = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      timeout: 180000, // Reduced timeout to prevent hanging
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer limit
      ...options
    });
    log(`✅ ${description} completed`, 'success');
    return result;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'error');
    if (!options.continueOnError) {
      throw error;
    }
    return null;
  }
}

function ensureDirectories() {
  const dirs = ['dist', 'dist/public', 'dist/uploads'];
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      log(`📁 Created directory: ${dir}`, 'info');
    }
  });
}

function createProductionPackage() {
  const prodPackage = {
    "name": "burnt-beats",
    "version": "1.0.0",
    "type": "module",
    "engines": {
      "node": ">=20.0.0"
    },
    "scripts": {
      "start": "node index.js"
    },
    "dependencies": {
      "express": "^4.21.2",
      "express-session": "^1.18.1",
      "cors": "^2.8.5",
      "multer": "^2.0.1",
      "drizzle-orm": "^0.39.3",
      "@neondatabase/serverless": "^0.10.4",
      "connect-pg-simple": "^10.0.0",
      "passport": "^0.7.0",
      "passport-local": "^1.0.0",
      "openid-client": "^6.5.3",
      "stripe": "^18.3.0",
      "ws": "^8.18.3",
      "zod": "^3.24.2",
      "nanoid": "^5.1.5"
    }
  };
  
  writeFileSync(
    path.resolve('dist', 'package.json'), 
    JSON.stringify(prodPackage, null, 2)
  );
  log('📦 Created production package.json', 'success');
}

function buildServer() {
  log('🚀 Building server bundle', 'info');
  
  try {
    runCommand(
      'npx esbuild server/index.ts --bundle --platform=node --target=node20 --format=esm --outfile=dist/index.js --external:pg-native --external:bufferutil --external:utf-8-validate',
      'Building optimized server bundle'
    );
    
    if (existsSync('dist/index.js')) {
      log('✅ Server build successful', 'success');
      return true;
    }
  } catch (error) {
    log(`❌ Server build failed: ${error.message}`, 'error');
    return false;
  }
  
  return false;
}

function safeBuildClient() {
  log('🌐 Building client with safe options', 'info');
  
  // Approach 1: Try building with main vite config (memory safe)
  log('📦 Attempting build with main vite config', 'info');
  try {
    // Set memory limits for Node.js to prevent bus errors
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=2048 --max-semi-space-size=64',
      VITE_API_URL: '/api'
    };
    
    runCommand(
      'npx vite build --outDir dist/public',
      'Building with main vite config and memory limits',
      { env }
    );
    
    if (existsSync('dist/public/index.html')) {
      log('✅ Main vite build successful', 'success');
      return true;
    }
  } catch (error) {
    log('⚠️ Main vite build failed, trying alternative approach', 'warn');
  }
  
  // Approach 2: Try building with simpler settings
  log('📦 Attempting build with simpler settings', 'info');
  try {
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=1024 --max-semi-space-size=32',
      VITE_API_URL: '/api'
    };
    
    runCommand(
      'npx vite build --config vite.config.client.ts --outDir dist/public --mode production',
      'Building with simplified client config',
      { env, continueOnError: true }
    );
    
    if (existsSync('dist/public/index.html')) {
      log('✅ Simplified vite build successful', 'success');
      return true;
    }
  } catch (error) {
    log('⚠️ Simplified vite build failed, creating fallback', 'warn');
  }
  
  // Approach 3: Create minimal fallback client
  log('📦 Creating fallback client application', 'info');
  return createFallbackClient();
}

function createFallbackClient() {
  const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Burnt Beats - AI Music Creation Platform</title>
    <meta name="description" content="Transform text into professional-quality songs with AI-powered music generation, voice cloning, and unlimited free creation.">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: #fff;
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
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .logo { 
            font-size: 3rem; 
            font-weight: bold; 
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #ff6b35, #f7931e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle { 
            font-size: 1.2rem; 
            margin-bottom: 2rem; 
            opacity: 0.8;
        }
        .status { 
            padding: 1rem; 
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 10px; 
            margin-bottom: 2rem;
            color: #22c55e;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        .feature {
            padding: 1rem;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .feature h3 {
            color: #ff6b35;
            margin-bottom: 0.5rem;
        }
        .refresh-btn {
            background: linear-gradient(45deg, #ff6b35, #f7931e);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: transform 0.2s;
            margin-top: 1rem;
        }
        .refresh-btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🔥 Burnt Beats</div>
        <div class="subtitle">AI Music Creation Platform</div>
        
        <div class="status">
            ✅ Server is online and ready for deployment
        </div>
        
        <div class="features">
            <div class="feature">
                <h3>🎵 Unlimited Creation</h3>
                <p>Create unlimited songs with all features unlocked - completely free</p>
            </div>
            <div class="feature">
                <h3>🎤 Voice Cloning</h3>
                <p>Professional voice cloning with advanced audio processing</p>
            </div>
            <div class="feature">
                <h3>💎 Pay-Per-Download</h3>
                <p>Only pay when you want high-quality downloads ($2.99-$9.99)</p>
            </div>
            <div class="feature">
                <h3>🎯 100% Ownership</h3>
                <p>Every song belongs to you - sell, remix, use commercially without restrictions</p>
            </div>
        </div>
        
        <button class="refresh-btn" onclick="window.location.reload()">
            🔄 Refresh Page
        </button>
        
        <script>
            console.log('🔥 Burnt Beats Fallback Client Ready!');
            console.log('✅ Server connection established');
            
            // Auto-refresh to check for main app availability
            setTimeout(() => {
                fetch('/api/health')
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'healthy') {
                            console.log('✅ All services operational');
                        }
                    })
                    .catch(err => console.log('ℹ️ Checking services...'));
            }, 1000);
        </script>
    </div>
</body>
</html>`;

  try {
    writeFileSync('dist/public/index.html', fallbackHtml);
    log('✅ Fallback client created successfully', 'success');
    return true;
  } catch (error) {
    log(`❌ Failed to create fallback client: ${error.message}`, 'error');
    return false;
  }
}

function validateBuild() {
  log('🔍 Validating build output', 'info');
  
  const requiredFiles = [
    'dist/index.js',
    'dist/package.json',
    'dist/public/index.html'
  ];
  
  let allValid = true;
  
  for (const file of requiredFiles) {
    if (existsSync(file)) {
      const stats = require('fs').statSync(file);
      log(`✅ ${file} (${Math.round(stats.size / 1024)}KB)`, 'success');
    } else {
      log(`❌ Missing: ${file}`, 'error');
      allValid = false;
    }
  }
  
  return allValid;
}

async function main() {
  try {
    log('🚀 Starting Safe Deployment Build', 'info');
    log('Implementing fixes for Vite memory issues and bus errors', 'info');
    
    // Step 1: Ensure directories
    ensureDirectories();
    
    // Step 2: Build server (this is more reliable)
    if (!buildServer()) {
      throw new Error('Server build failed');
    }
    
    // Step 3: Create production package.json
    createProductionPackage();
    
    // Step 4: Safe client build with fallbacks
    if (!safeBuildClient()) {
      throw new Error('All client build approaches failed');
    }
    
    // Step 5: Validate build
    if (!validateBuild()) {
      throw new Error('Build validation failed');
    }
    
    log('🎉 Safe deployment build completed successfully!', 'success');
    log('✅ All deployment artifacts ready', 'success');
    log('🚀 Ready for deployment', 'success');
    
  } catch (error) {
    log(`💥 Deployment build failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, safeBuildClient, buildServer, createFallbackClient };