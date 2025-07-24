// Database setup script for Replit
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Setting up database connection...');

// Get Replit database URL
const getDatabaseUrl = () => {
    try {
        // Check if we're running in Replit
        if (process.env.REPL_ID && process.env.REPL_OWNER) {
            // Use Replit's PostgreSQL database
            return `postgresql://${process.env.REPL_OWNER}:${process.env.REPL_SLUG}@${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co:5432/${process.env.REPL_SLUG}`;
        } else {
            // Local development fallback
            return 'postgresql://localhost:5432/burntbeats';
        }
    } catch (error) {
        console.error('Error getting database URL:', error);
        return null;
    }
};

// Update .env file with database URL
const updateEnvFile = (databaseUrl) => {
    try {
        const envPath = path.join(__dirname, '.env');
        let envContent = '';

        // Read existing .env file if it exists
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');

            // Remove existing DATABASE_URL line if present
            envContent = envContent
                .split('\n')
                .filter(line => !line.startsWith('DATABASE_URL='))
                .join('\n');
        }

        // Add the new DATABASE_URL
        envContent += `\nDATABASE_URL=${databaseUrl}\n`;

        // Write the updated content back to .env
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Updated .env file with DATABASE_URL');
    } catch (error) {
        console.error('Error updating .env file:', error);
    }
};

// Main function
const setupDatabase = () => {
    const databaseUrl = getDatabaseUrl();

    if (!databaseUrl) {
        console.error('❌ Failed to determine database URL');
        process.exit(1);
    }

    console.log(`📊 Database URL: ${databaseUrl}`);
    updateEnvFile(databaseUrl);

    // Set environment variable for current process
    process.env.DATABASE_URL = databaseUrl;

    console.log('✅ Database setup complete!');
};

setupDatabase();