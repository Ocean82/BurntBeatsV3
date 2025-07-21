"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbOperations = exports.db = void 0;
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const serverless_1 = require("@neondatabase/serverless");
const drizzle_orm_1 = require("drizzle-orm");
const ws_1 = __importDefault(require("ws"));
const schema = __importStar(require("../shared/schema.js"));
// NEON DATABASE CONFIGURATION
// NOTE: Configures Neon serverless database connection
// TODO: Add connection pooling optimization and retry logic
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
// DATABASE CONNECTION SETUP
// NOTE: Establishes connection to Neon PostgreSQL database
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}
// DATABASE POOL AND ORM INITIALIZATION
// NOTE: Creates connection pool and Drizzle ORM instance
const pool = new serverless_1.Pool({ connectionString });
exports.db = (0, neon_serverless_1.drizzle)(pool, { schema });
// DATABASE OPERATIONS MODULE
// NOTE: Centralized database operations for all entities
// TODO: Add transaction support and error handling middleware
exports.dbOperations = {
    // USER OPERATIONS
    // NOTE: Database operations for user management
    // TODO: Add input validation and sanitization
    // GET USER BY ID
    // NOTE: Retrieves a single user by their unique ID
    async getUserById(id) {
        try {
            const [user] = await exports.db.select().from(schema.users).where((0, drizzle_orm_1.eq)(schema.users.id, id));
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
        const [user] = await exports.db.insert(schema.users).values(userData).returning();
        return user;
    },
    // UPDATE USER INFORMATION
    // NOTE: Updates user data and automatically sets updatedAt timestamp
    async updateUser(id, updates) {
        try {
            const [user] = await exports.db.update(schema.users)
                .set({ ...updates, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema.users.id, id))
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
            return await exports.db.select().from(schema.songs)
                .where((0, drizzle_orm_1.eq)(schema.songs.userId, userId) && (0, drizzle_orm_1.eq)(schema.songs.isDeleted, false))
                .orderBy(schema.songs.createdAt);
        }
        catch (error) {
            console.error('Error getting user songs:', error);
            throw error;
        }
    },
    async createSong(songData) {
        const [song] = await exports.db.insert(schema.songs).values(songData).returning();
        return song;
    },
    async updateSong(id, updates) {
        const [song] = await exports.db.update(schema.songs)
            .set({ ...updates, updatedAt: new Date() })
            .where({ id })
            .returning();
        return song;
    },
    async deleteSong(id) {
        const [song] = await exports.db.update(schema.songs)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where({ id })
            .returning();
        return song;
    },
    // Voice sample operations
    async getUserVoiceSamples(userId) {
        return await exports.db.select().from(schema.voiceSamples)
            .where({ userId, isDeleted: false })
            .orderBy('createdAt DESC');
    },
    async createVoiceSample(sampleData) {
        const [sample] = await exports.db.insert(schema.voiceSamples).values(sampleData).returning();
        return sample;
    },
    async deleteVoiceSample(id) {
        const [sample] = await exports.db.update(schema.voiceSamples)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where({ id })
            .returning();
        return sample;
    },
    // Voice clone operations
    async getUserVoiceClones(userId) {
        return await exports.db.select().from(schema.voiceClones)
            .where({ userId, isDeleted: false })
            .orderBy('createdAt DESC');
    },
    async createVoiceClone(cloneData) {
        const [clone] = await exports.db.insert(schema.voiceClones).values(cloneData).returning();
        return clone;
    },
    // License operations
    async createLicenseAcknowledgment(ackData) {
        const [ack] = await exports.db.insert(schema.licenseAcknowledgments).values(ackData).returning();
        return ack;
    },
    // Health check
    async healthCheck() {
        try {
            const result = await exports.db.select().from(schema.users).limit(1);
            return { status: 'healthy', database: true };
        }
        catch (error) {
            return { status: 'unhealthy', database: false, error: error.message };
        }
    }
};
//# sourceMappingURL=db.js.map