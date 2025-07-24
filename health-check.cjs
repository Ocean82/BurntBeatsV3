// Health check script for BurntBeatz
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running health check...');

// Load environment variables from .env file
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim();
                if (key && value) {
                    process.env[key] = value;
                }
            }
        });
    }
} catch (error) {
    console.error('Error loading .env file:', error);
}

// Get port from environment variable or use default
const PORT = process.env.PORT || 5000;

// Check if server is running
const checkServer = () => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: '/health',
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        resolve(response);
                    } catch (error) {
                        reject(new Error(`Invalid JSON response: ${data}`));
                    }
                } else {
                    reject(new Error(`Server responded with status code ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timed out'));
        });

        req.end();
    });
};

// Check if storage directories exist
const checkStorage = () => {
    const directories = [
        'storage/midi',
        'storage/voices',
        'storage/temp',
        'storage/models'
    ];

    const results = directories.map(dir => {
        const fullPath = path.join(__dirname, dir);
        const exists = fs.existsSync(fullPath);
        return { directory: dir, exists };
    });

    return results;
};

// Check if dist directory exists
const checkDist = () => {
    const distPath = path.join(__dirname, 'dist');
    const indexPath = path.join(distPath, 'index.js');

    return {
        distExists: fs.existsSync(distPath),
        indexExists: fs.existsSync(indexPath)
    };
};

// Run all checks
const runChecks = async () => {
    console.log(`\n🔍 Checking server on port ${PORT}...`);
    try {
        const serverStatus = await checkServer();
        console.log('✅ Server is running');
        console.log('📊 Server status:', serverStatus);
    } catch (error) {
        console.error('❌ Server check failed:', error.message);
    }

    console.log('\n🔍 Checking storage directories...');
    const storageStatus = checkStorage();
    storageStatus.forEach(status => {
        if (status.exists) {
            console.log(`✅ ${status.directory} exists`);
        } else {
            console.error(`❌ ${status.directory} does not exist`);
        }
    });

    console.log('\n🔍 Checking build artifacts...');
    const distStatus = checkDist();
    if (distStatus.distExists) {
        console.log('✅ dist directory exists');
    } else {
        console.error('❌ dist directory does not exist');
    }

    if (distStatus.indexExists) {
        console.log('✅ dist/index.js exists');
    } else {
        console.error('❌ dist/index.js does not exist');
    }

    console.log('\n🔍 Health check complete');
};

runChecks().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
});