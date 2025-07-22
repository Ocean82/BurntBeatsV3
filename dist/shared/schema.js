"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.songVersionRelations = exports.voiceCloneRelations = exports.voiceSampleRelations = exports.songRelations = exports.userRelations = exports.userAgreementRecords = exports.licenseAcknowledgments = exports.songVersions = exports.voiceClones = exports.voiceSamples = exports.songs = exports.users = exports.sessions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const cuid2_1 = require("@paralleldrive/cuid2");
// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]);
// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().notNull(),
    email: (0, pg_core_1.varchar)("email").unique(),
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    profileImageUrl: (0, pg_core_1.varchar)("profile_image_url"),
    username: (0, pg_core_1.text)("username").unique(),
    password: (0, pg_core_1.text)("password"),
    passwordResetToken: (0, pg_core_1.text)("password_reset_token"),
    passwordResetExpires: (0, pg_core_1.timestamp)("password_reset_expires"),
    plan: (0, pg_core_1.text)("plan").default("free"),
    songsGenerated: (0, pg_core_1.integer)("songs_generated").default(0),
    maxSongs: (0, pg_core_1.integer)("max_songs").default(3),
    songsThisMonth: (0, pg_core_1.integer)("songs_this_month").default(0),
    lastUsageReset: (0, pg_core_1.timestamp)("last_usage_reset").defaultNow(),
    stripeCustomerId: (0, pg_core_1.text)("stripe_customer_id"),
    subscriptionId: (0, pg_core_1.text)("subscription_id"),
    subscriptionStatus: (0, pg_core_1.text)("subscription_status"),
    agreementAccepted: (0, pg_core_1.boolean)("agreement_accepted").default(false),
    agreementAcceptedAt: (0, pg_core_1.timestamp)("agreement_accepted_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Songs table
exports.songs = (0, pg_core_1.pgTable)("songs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    userId: (0, pg_core_1.text)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    lyrics: (0, pg_core_1.text)("lyrics"),
    style: (0, pg_core_1.text)("style"),
    mood: (0, pg_core_1.text)("mood"),
    tempo: (0, pg_core_1.integer)("tempo"),
    voiceSampleId: (0, pg_core_1.integer)("voice_sample_id"),
    parentSongId: (0, pg_core_1.integer)("parent_song_id"),
    forkedFromId: (0, pg_core_1.integer)("forked_from_id"),
    generatedAudioPath: (0, pg_core_1.text)("generated_audio_path"),
    status: (0, pg_core_1.text)("status").default("pending"),
    generationProgress: (0, pg_core_1.integer)("generation_progress").default(0),
    isDeleted: (0, pg_core_1.boolean)("is_deleted").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)("deleted_at"),
});
// Voice samples table
exports.voiceSamples = (0, pg_core_1.pgTable)("voice_samples", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    filePath: (0, pg_core_1.text)("file_path").notNull(),
    duration: (0, pg_core_1.integer)("duration"),
    format: (0, pg_core_1.text)("format"),
    isDeleted: (0, pg_core_1.boolean)("is_deleted").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)("deleted_at"),
});
// Voice clones table
exports.voiceClones = (0, pg_core_1.pgTable)("voice_clones", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    originalVoiceId: (0, pg_core_1.integer)("original_voice_id").references(() => exports.voiceSamples.id, { onDelete: "set null" }),
    clonedVoicePath: (0, pg_core_1.text)("cloned_voice_path"),
    status: (0, pg_core_1.text)("status").default("pending"),
    quality: (0, pg_core_1.text)("quality").default("medium"),
    isDeleted: (0, pg_core_1.boolean)("is_deleted").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)("deleted_at"),
});
// Song versions table
exports.songVersions = (0, pg_core_1.pgTable)("song_versions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    songId: (0, pg_core_1.integer)("song_id").notNull().references(() => exports.songs.id, { onDelete: "cascade" }),
    version: (0, pg_core_1.integer)("version").notNull(),
    changes: (0, pg_core_1.jsonb)("changes"),
    audioPath: (0, pg_core_1.text)("audio_path"),
    isDeleted: (0, pg_core_1.boolean)("is_deleted").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)("deleted_at"),
});
// License Acknowledgments Table
exports.licenseAcknowledgments = (0, pg_core_1.pgTable)("license_acknowledgments", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    userId: (0, pg_core_1.text)("user_id").notNull(),
    trackId: (0, pg_core_1.text)("track_id").notNull(),
    acceptedAt: (0, pg_core_1.timestamp)("accepted_at").notNull(),
    purchaseId: (0, pg_core_1.text)("purchase_id"), // Optional Stripe session ID
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow()
});
// User Agreement Records Table - Compressed filing system for agreement retention
exports.userAgreementRecords = (0, pg_core_1.pgTable)("user_agreement_records", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    userId: (0, pg_core_1.text)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    username: (0, pg_core_1.text)("username").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    acceptedAt: (0, pg_core_1.timestamp)("accepted_at").notNull(),
    ipAddress: (0, pg_core_1.text)("ip_address"),
    userAgent: (0, pg_core_1.text)("user_agent"),
    compressedRecord: (0, pg_core_1.text)("compressed_record").notNull(), // Base64 compressed JSON
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Define relations for proper ownership tracking
exports.userRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    songs: many(exports.songs),
    voiceSamples: many(exports.voiceSamples),
    voiceClones: many(exports.voiceClones),
}));
exports.songRelations = (0, drizzle_orm_1.relations)(exports.songs, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.songs.userId],
        references: [exports.users.id],
    }),
    voiceSample: one(exports.voiceSamples, {
        fields: [exports.songs.voiceSampleId],
        references: [exports.voiceSamples.id],
    }),
    parentSong: one(exports.songs, {
        fields: [exports.songs.parentSongId],
        references: [exports.songs.id],
    }),
    forkedFrom: one(exports.songs, {
        fields: [exports.songs.forkedFromId],
        references: [exports.songs.id],
    }),
    versions: many(exports.songVersions),
}));
exports.voiceSampleRelations = (0, drizzle_orm_1.relations)(exports.voiceSamples, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.voiceSamples.userId],
        references: [exports.users.id],
    }),
    songs: many(exports.songs),
    voiceClones: many(exports.voiceClones),
}));
exports.voiceCloneRelations = (0, drizzle_orm_1.relations)(exports.voiceClones, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.voiceClones.userId],
        references: [exports.users.id],
    }),
    originalVoice: one(exports.voiceSamples, {
        fields: [exports.voiceClones.originalVoiceId],
        references: [exports.voiceSamples.id],
    }),
}));
exports.songVersionRelations = (0, drizzle_orm_1.relations)(exports.songVersions, ({ one }) => ({
    song: one(exports.songs, {
        fields: [exports.songVersions.songId],
        references: [exports.songs.id],
    }),
}));
