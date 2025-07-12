#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

// Ensure required directories exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log('🚀 Starting Burnt Beats Production Server');
console.log(`📡 Port: ${process.env.PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

// Start the main server
require('./index.cjs');