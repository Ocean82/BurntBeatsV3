
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '../shared/schema.js';

// Configure Neon WebSocket
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

// Database operations
export const dbOperations = {
  // User operations
  async getUserById(id: string) {
    const [user] = await db.select().from(schema.users).where({ id });
    return user;
  },

  async createUser(userData: typeof schema.users.$inferInsert) {
    const [user] = await db.insert(schema.users).values(userData).returning();
    return user;
  },

  async updateUser(id: string, updates: Partial<typeof schema.users.$inferInsert>) {
    const [user] = await db.update(schema.users)
      .set({ ...updates, updatedAt: new Date() })
      .where({ id })
      .returning();
    return user;
  },

  // Song operations
  async getUserSongs(userId: string) {
    return await db.select().from(schema.songs)
      .where({ userId, isDeleted: false })
      .orderBy('createdAt DESC');
  },

  async createSong(songData: typeof schema.songs.$inferInsert) {
    const [song] = await db.insert(schema.songs).values(songData).returning();
    return song;
  },

  async updateSong(id: number, updates: Partial<typeof schema.songs.$inferInsert>) {
    const [song] = await db.update(schema.songs)
      .set({ ...updates, updatedAt: new Date() })
      .where({ id })
      .returning();
    return song;
  },

  async deleteSong(id: number) {
    const [song] = await db.update(schema.songs)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where({ id })
      .returning();
    return song;
  },

  // Voice sample operations
  async getUserVoiceSamples(userId: string) {
    return await db.select().from(schema.voiceSamples)
      .where({ userId, isDeleted: false })
      .orderBy('createdAt DESC');
  },

  async createVoiceSample(sampleData: typeof schema.voiceSamples.$inferInsert) {
    const [sample] = await db.insert(schema.voiceSamples).values(sampleData).returning();
    return sample;
  },

  async deleteVoiceSample(id: number) {
    const [sample] = await db.update(schema.voiceSamples)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where({ id })
      .returning();
    return sample;
  },

  // Voice clone operations
  async getUserVoiceClones(userId: string) {
    return await db.select().from(schema.voiceClones)
      .where({ userId, isDeleted: false })
      .orderBy('createdAt DESC');
  },

  async createVoiceClone(cloneData: typeof schema.voiceClones.$inferInsert) {
    const [clone] = await db.insert(schema.voiceClones).values(cloneData).returning();
    return clone;
  },

  // License operations
  async createLicenseAcknowledgment(ackData: typeof schema.licenseAcknowledgments.$inferInsert) {
    const [ack] = await db.insert(schema.licenseAcknowledgments).values(ackData).returning();
    return ack;
  },

  // Health check
  async healthCheck() {
    try {
      const result = await db.select().from(schema.users).limit(1);
      return { status: 'healthy', database: true };
    } catch (error) {
      return { status: 'unhealthy', database: false, error: error.message };
    }
  }
};
