// Health check endpoint for Burnt Beats
const express = require('express');

function setupHealthCheck(app) {
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'burnt-beats',
      version: '1.0.0',
      deployment: 'production'
    });
  });
  
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

module.exports = { setupHealthCheck };
