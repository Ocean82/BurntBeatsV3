import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, desc, sql } from "drizzle-orm";
import * as schema from '../shared/schema.js';
import type { User, Song } from '../shared/schema.js';

// Database configuration
const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/burntbeats';

// Create postgres client
const client = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Initialize Drizzle ORM
export const db = drizzle(client, { schema });

// Database operations
export async function createUser(userData: {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}) {
  try {
    const [user] = await db.insert(schema.users).values({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserById(id: string) {
  try {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function createSong(songData: {
  title: string;
  userId: string;
  style?: string;
  mood?: string;
  tempo?: number;
  generatedAudioPath?: string;
  parentSongId?: number;
}) {
  try {
    const [song] = await db.insert(schema.songs).values(songData).returning() as Song[];
    return song;
  } catch (error) {
    console.error('Error creating song:', error);
    throw error;
  }
}

export async function getSongById(id: number): Promise<Song | null> {
  const [song] = await db
    .select()
    .from(schema.songs)
    .where(eq(schema.songs.id, id))
    .limit(1);

  return song || null;
}

export async function getSongsByUserId(userId: string) {
  try {
    const songs = await db
      .select()
      .from(schema.songs)
      .where(eq(schema.songs.userId, userId))
      .orderBy(desc(schema.songs.createdAt));
    return songs;
  } catch (error) {
    console.error('Error getting user songs:', error);
    throw error;
  }
}

export async function getVoiceSamplesByUserId(userId: string) {
  try {
    const samples = await db
      .select()
      .from(schema.voiceSamples)
      .where(and(eq(schema.voiceSamples.userId, userId), eq(schema.voiceSamples.isDeleted, false)))
      .orderBy(desc(schema.voiceSamples.createdAt));
    return samples;
  } catch (error) {
    console.error('Error getting voice samples:', error);
    throw error;
  }
}

export async function getVoiceClonesByUserId(userId: string) {
  try {
    const clones = await db
      .select()
      .from(schema.voiceClones)
      .where(and(eq(schema.voiceClones.userId, userId), eq(schema.voiceClones.isDeleted, false)))
      .orderBy(desc(schema.voiceClones.createdAt));
    return clones;
  } catch (error) {
    console.error('Error getting voice clones:', error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await db.execute(sql`SELECT 1`);
    return { status: 'healthy', database: true };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { 
      status: 'unhealthy', 
      database: false, 
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

// Close database connection
export async function closeDatabaseConnection() {
  try {
    await client.end();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}