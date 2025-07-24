// Comprehensive deployment script for Replit
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting BurntBeatz deployment for Replit...');

// Helper function to run a command and log output
const runCommand = (command, message) => {
    console.log(`\n🔧 ${message}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return false;
    }
};

// Main deployment function
const deploy = async () => {
    // Step 1: Setup database connection
    console.log('\n📊 Step 1: Setting up database connection');
    if (!runCommand('node setup-database.cjs', 'Setting up database connection')) {
        console.error('❌ Failed to set up database connection');
        process.exit(1);
    }

    // Step 2: Install dependencies
    console.log('\n📦 Step 2: Installing dependencies');
    if (!runCommand('npm install --no-optional --prefer-offline', 'Installing dependencies')) {
        console.warn('⚠️ Some dependencies failed to install, continuing anyway...');
    }

    // Step 3: Install Python dependencies
    console.log('\n🐍 Step 3: Installing Python dependencies');
    if (!runCommand('pip install -r requirements.txt', 'Installing Python dependencies')) {
        console.warn('⚠️ Some Python dependencies failed to install, continuing anyway...');
    }

    // Step 4: Run database migrations
    console.log('\n🔄 Step 4: Running database migrations');
    if (!runCommand('npm run db:migrate:replit', 'Running database migrations')) {
        console.warn('⚠️ Database migrations failed, continuing anyway...');
    }

    // Step 5: Build the application
    console.log('\n🏗️ Step 5: Building the application');
    if (!runCommand('node lightweight-deploy.cjs', 'Building the application')) {
        console.error('❌ Failed to build the application');
        process.exit(1);
    }

    // Step 6: Create necessary directories
    console.log('\n📁 Step 6: Creating necessary directories');
    const directories = [
        'storage/midi/generated',
        'storage/midi/user-uploads',
        'storage/voices',
        'storage/temp',
        'storage/models/audioldm2'
    ];

    directories.forEach(dir => {
        const fullPath = path.join(__dirname, dir);
        if (!fs.existsSync(fullPath)) {
            console.log(`Creating directory: ${dir}`);
            fs.mkdirSync(fullPath, { recursive: true });
        }
    });

    // Step 7: Set up environment variables in .env file
    console.log('\n🔐 Step 7: Setting up environment variables');
    const envPath = path.join(__dirname, '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Add or update environment variables
    const envVars = {
        NODE_ENV: 'production',
        PORT: '5000',
        AUTO_DOWNLOAD_MODELS: 'true',
        OFFLINE_MODE: 'false'
    };

    Object.entries(envVars).forEach(([key, value]) => {
        // Remove existing entry if present
        envContent = envContent
            .split('\n')
            .filter(line => !line.startsWith(`${key}=`))
            .join('\n');

        // Add new entry
        envContent += `\n${key}=${value}`;
    });

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment variables set up successfully');

    // Step 8: Final checks
    console.log('\n🔍 Step 8: Running final checks');

    // Check if dist directory exists
    if (!fs.existsSync(path.join(__dirname, 'dist'))) {
        console.error('❌ dist directory does not exist');
        process.exit(1);
    }

    // Check if index.js exists in dist
    if (!fs.existsSync(path.join(__dirname, 'dist', 'index.js'))) {
        console.error('❌ index.js does not exist in dist directory');
        process.exit(1);
    }

    console.log('✅ All checks passed');

    // Deployment complete
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n🚀 To start the server:');
    console.log('   cd dist && node index.js');
    console.log('   OR: npm start');
};

// Run the deployment
deploy().catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
});