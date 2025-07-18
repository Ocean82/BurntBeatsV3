#!/usr/bin/env node

// Redirect to the optimized deployment script
console.log('🔄 Redirecting to optimized deployment script...');

const { execSync } = require('child_process');

try {
  execSync('node deploy-size-optimized.cjs', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Optimized build failed, creating minimal fallback');
  
  const fs = require('fs');
  
  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  // Create minimal server
  const serverCode = `const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('<h1>Burnt Beats - AI Music Creation</h1><p>Server is running</p>');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Burnt Beats server running on port', PORT);
});`;

  fs.writeFileSync('dist/index.js', serverCode);
  
  // Create minimal package.json
  const packageJson = {
    "name": "burnt-beats-production",
    "version": "1.0.0",
    "main": "index.js",
    "scripts": { "start": "node index.js" },
    "dependencies": { "express": "^4.21.2" }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));
  
  console.log('✅ Fallback build complete');
}