import { Pool } from '@neondatabase/serverless';
import * as schema from '../shared/schema.js';
export declare const db: import("drizzle-orm/neon-serverless").NeonDatabase<typeof schema> & {
    $client: Pool;
};
export declare const dbOperations: {
    getUserById(id: string): Promise<{
        id: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        profileImageUrl: string | null;
        username: string | null;
        password: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        plan: string | null;
        songsGenerated: number | null;
        maxSongs: number | null;
        songsThisMonth: number | null;
        lastUsageReset: Date | null;
        stripeCustomerId: string | null;
        subscriptionId: string | null;
        subscriptionStatus: string | null;
        agreementAccepted: boolean | null;
        agreementAcceptedAt: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    createUser(userData: typeof schema.users.$inferInsert): Promise<{
        id: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        profileImageUrl: string | null;
        username: string | null;
        password: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        plan: string | null;
        songsGenerated: number | null;
        maxSongs: number | null;
        songsThisMonth: number | null;
        lastUsageReset: Date | null;
        stripeCustomerId: string | null;
        subscriptionId: string | null;
        subscriptionStatus: string | null;
        agreementAccepted: boolean | null;
        agreementAcceptedAt: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    updateUser(id: string, updates: Partial<typeof schema.users.$inferInsert>): Promise<{
        id: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        profileImageUrl: string | null;
        username: string | null;
        password: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        plan: string | null;
        songsGenerated: number | null;
        maxSongs: number | null;
        songsThisMonth: number | null;
        lastUsageReset: Date | null;
        stripeCustomerId: string | null;
        subscriptionId: string | null;
        subscriptionStatus: string | null;
        agreementAccepted: boolean | null;
        agreementAcceptedAt: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    getUserSongs(userId: string): Promise<{
        [x: string]: any;
    }[]>;
    createSong(songData: typeof schema.songs.$inferInsert): Promise<any>;
    updateSong(id: number, updates: Partial<typeof schema.songs.$inferInsert>): Promise<{
        [x: string]: any;
    }>;
    deleteSong(id: number): Promise<{
        [x: string]: any;
    }>;
    getUserVoiceSamples(userId: string): Promise<{
        id: number;
        userId: string;
        name: string;
        filePath: string;
        duration: number | null;
        format: string | null;
        isDeleted: boolean | null;
        createdAt: Date | null;
        deletedAt: Date | null;
    }[]>;
    createVoiceSample(sampleData: typeof schema.voiceSamples.$inferInsert): Promise<{
        name: string;
        id: number;
        createdAt: Date | null;
        userId: string;
        filePath: string;
        duration: number | null;
        format: string | null;
        isDeleted: boolean | null;
        deletedAt: Date | null;
    }>;
    deleteVoiceSample(id: number): Promise<{
        id: number;
        userId: string;
        name: string;
        filePath: string;
        duration: number | null;
        format: string | null;
        isDeleted: boolean | null;
        createdAt: Date | null;
        deletedAt: Date | null;
    }>;
    getUserVoiceClones(userId: string): Promise<{
        id: number;
        userId: string;
        name: string;
        originalVoiceId: number | null;
        clonedVoicePath: string | null;
        status: string | null;
        quality: string | null;
        isDeleted: boolean | null;
        createdAt: Date | null;
        deletedAt: Date | null;
    }[]>;
    createVoiceClone(cloneData: typeof schema.voiceClones.$inferInsert): Promise<{
        name: string;
        id: number;
        createdAt: Date | null;
        userId: string;
        isDeleted: boolean | null;
        deletedAt: Date | null;
        status: string | null;
        originalVoiceId: number | null;
        clonedVoicePath: string | null;
        quality: string | null;
    }>;
    createLicenseAcknowledgment(ackData: typeof schema.licenseAcknowledgments.$inferInsert): Promise<{
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        userId: string;
        trackId: string;
        acceptedAt: Date;
        purchaseId: string | null;
    }>;
    healthCheck(): Promise<{
        status: string;
        database: boolean;
        error?: undefined;
    } | {
        status: string;
        database: boolean;
        error: any;
    }>;
};
