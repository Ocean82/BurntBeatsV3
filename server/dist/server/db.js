import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import ws from 'ws';
import * as schema from '../shared/schema.js';
// NEON DATABASE CONFIGURATION
// NOTE: Configures Neon serverless database connection
// TODO: Add connection pooling optimization and retry logic
neonConfig.webSocketConstructor = ws;
// DATABASE CONNECTION SETUP
// NOTE: Establishes connection to Neon PostgreSQL database
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}
// DATABASE POOL AND ORM INITIALIZATION
// NOTE: Creates connection pool and Drizzle ORM instance
const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
// DATABASE OPERATIONS MODULE
// NOTE: Centralized database operations for all entities
// TODO: Add transaction support and error handling middleware
export const dbOperations = {
    // USER OPERATIONS
    // NOTE: Database operations for user management
    // TODO: Add input validation and sanitization
    // GET USER BY ID
    // NOTE: Retrieves a single user by their unique ID
    async getUserById(id) {
        try {
            const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
            return user;
        }
        catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    },
    // CREATE NEW USER
    // NOTE: Inserts a new user record and returns the created user
    async createUser(userData) {
        const [user] = await db.insert(schema.users).values(userData).returning();
        return user;
    },
    // UPDATE USER INFORMATION
    // NOTE: Updates user data and automatically sets updatedAt timestamp
    async updateUser(id, updates) {
        try {
            const [user] = await db.update(schema.users)
                .set({ ...updates, updatedAt: new Date() })
                .where(eq(schema.users.id, id))
                .returning();
            return user;
        }
        catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },
    // Song operations
    async getUserSongs(userId) {
        try {
            return await db.select().from(schema.songs)
                .where(eq(schema.songs.userId, userId) && eq(schema.songs.isDeleted, false))
                .orderBy(schema.songs.createdAt);
        }
        catch (error) {
            console.error('Error getting user songs:', error);
            throw error;
        }
    },
    async createSong(songData) {
        const [song] = await db.insert(schema.songs).values(songData).returning();
        return song;
    },
    async updateSong(id, updates) {
        const [song] = await db.update(schema.songs)
            .set({ ...updates, updatedAt: new Date() })
            .where({ id })
            .returning();
        return song;
    },
    async deleteSong(id) {
        const [song] = await db.update(schema.songs)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where({ id })
            .returning();
        return song;
    },
    // Voice sample operations
    async getUserVoiceSamples(userId) {
        return await db.select().from(schema.voiceSamples)
            .where({ userId, isDeleted: false })
            .orderBy('createdAt DESC');
    },
    async createVoiceSample(sampleData) {
        const [sample] = await db.insert(schema.voiceSamples).values(sampleData).returning();
        return sample;
    },
    async deleteVoiceSample(id) {
        const [sample] = await db.update(schema.voiceSamples)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where({ id })
            .returning();
        return sample;
    },
    // Voice clone operations
    async getUserVoiceClones(userId) {
        return await db.select().from(schema.voiceClones)
            .where({ userId, isDeleted: false })
            .orderBy('createdAt DESC');
    },
    async createVoiceClone(cloneData) {
        const [clone] = await db.insert(schema.voiceClones).values(cloneData).returning();
        return clone;
    },
    // License operations
    async createLicenseAcknowledgment(ackData) {
        const [ack] = await db.insert(schema.licenseAcknowledgments).values(ackData).returning();
        return ack;
    },
    // Health check
    async healthCheck() {
        try {
            const result = await db.select().from(schema.users).limit(1);
            return { status: 'healthy', database: true };
        }
        catch (error) {
            return { status: 'unhealthy', database: false, error: error.message };
        }
    }
};
//# sourceMappingURL=db.js.map