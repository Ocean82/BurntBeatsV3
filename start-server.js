#!/usr/bin/env node

// This script starts the optimized Burnt Beats production server
// Uses the pre-built artifacts from deploy-size-optimized.cjs

const fs = require('fs');
const path = require('path');

console.log('🔥 Starting Burnt Beats production server...');

// Check if optimized build exists
if (fs.existsSync('dist/index.js')) {
  console.log('✅ Using optimized build from dist/index.js');
  require('./dist/index.js');
} else {
  console.log('⚠️ Optimized build not found, creating basic fallback server');
  
  // Create basic server as fallback
  const express = require('express');
  const app = express();
  const PORT = process.env.PORT || 5000;
  
  // Basic health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy',
      message: 'Burnt Beats server running',
      timestamp: new Date().toISOString(),
      mode: 'fallback'
    });
  });
  
  // Serve static files
  app.use(express.static('dist/public'));
  
  // Default route
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head><title>Burnt Beats</title></head>
        <body>
          <h1>🔥 Burnt Beats</h1>
          <p>AI Music Creation Platform</p>
          <p>Status: Running in fallback mode</p>
          <a href="/api/health">Health Check</a>
        </body>
      </html>
    `);
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Burnt Beats server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}