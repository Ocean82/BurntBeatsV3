// Startup script for Replit
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting BurntBeatz server...');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
    console.log('⚠️ dist directory not found, running deployment script...');
    try {
        execSync('node deploy-replit.cjs', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

// Check if index.js exists in dist
const indexPath = path.join(distPath, 'index.js');
if (!fs.existsSync(indexPath)) {
    console.error('❌ index.js not found in dist directory');
    process.exit(1);
}

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

// Start the server
console.log('🚀 Starting server...');
try {
    process.chdir(distPath);
    require(indexPath);
} catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
}