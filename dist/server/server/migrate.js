import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Configure Neon WebSocket
neonConfig.webSocketConstructor = ws;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}
const pool = new Pool({ connectionString });
const db = drizzle(pool);
async function runMigration() {
    try {
        console.log('🔄 Running database migrations...');
        await migrate(db, { migrationsFolder: './migrations' });
        console.log('✅ Database migrations completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}
runMigration();
