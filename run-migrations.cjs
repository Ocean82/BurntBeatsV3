// Database migration script for Replit
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Running database migrations...');

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
        console.log('✅ Loaded environment variables from .env file');
    }
} catch (error) {
    console.error('Error loading .env file:', error);
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('🔧 Please run setup-database.cjs first');
    process.exit(1);
}

// Run migrations
try {
    console.log('🔄 Running migrations from migrations directory...');

    // Create a temporary migration script
    const tempScriptPath = path.join(__dirname, 'temp-migrate.cjs');
    const migrateScript = `
    const { drizzle } = require('drizzle-orm/postgres-js');
    const { migrate } = require('drizzle-orm/postgres-js/migrator');
    const postgres = require('postgres');
    
    async function runMigration() {
      try {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
          throw new Error('DATABASE_URL environment variable is required');
        }
        
        const client = postgres(connectionString);
        const db = drizzle(client);
        
        console.log('🔄 Running database migrations...');
        await migrate(db, { migrationsFolder: './migrations' });
        console.log('✅ Database migrations completed successfully!');
        process.exit(0);
      } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
      }
    }
    
    runMigration();
  `;

    fs.writeFileSync(tempScriptPath, migrateScript);

    // Run the migration script
    execSync(`node ${tempScriptPath}`, { stdio: 'inherit' });

    // Clean up
    fs.unlinkSync(tempScriptPath);

    console.log('✅ Database migrations completed successfully!');
} catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
}