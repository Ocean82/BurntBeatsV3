"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const migrator_1 = require("drizzle-orm/neon-serverless/migrator");
const serverless_1 = require("@neondatabase/serverless");
const ws_1 = __importDefault(require("ws"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Configure Neon WebSocket
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}
const pool = new serverless_1.Pool({ connectionString });
const db = (0, neon_serverless_1.drizzle)(pool);
async function runMigration() {
    try {
        console.log('🔄 Running database migrations...');
        await (0, migrator_1.migrate)(db, { migrationsFolder: './migrations' });
        console.log('✅ Database migrations completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}
runMigration();
//# sourceMappingURL=migrate.js.map