import postgres from 'postgres';
import * as schema from '../shared/schema.js';
export declare const db: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
};
export declare function createUser(userData: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
}): Promise<{
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
export declare function getUserById(id: string): Promise<{
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
export declare function getUserByEmail(email: string): Promise<{
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
export declare function createSong(songData: {
    title: string;
    userId: number;
    style?: string;
    mood?: string;
    tempo?: number;
    generatedAudioPath?: string;
    parentSongId?: number;
}): Promise<any>;
export declare function getSongById(id: number): Promise<{
    [x: string]: any;
}>;
export declare function getSongsByUserId(userId: number): Promise<{
    [x: string]: any;
}[]>;
export declare function getVoiceSamplesByUserId(userId: number): Promise<{
    id: number;
    userId: number;
    name: string;
    filePath: string;
    duration: number | null;
    format: string | null;
    isDeleted: boolean | null;
    createdAt: Date | null;
    deletedAt: Date | null;
}[]>;
export declare function getVoiceClonesByUserId(userId: number): Promise<{
    id: number;
    userId: number;
    name: string;
    originalVoiceId: number | null;
    clonedVoicePath: string | null;
    status: string | null;
    quality: string | null;
    isDeleted: boolean | null;
    createdAt: Date | null;
    deletedAt: Date | null;
}[]>;
export declare function checkDatabaseHealth(): Promise<{
    status: string;
    database: boolean;
    error?: undefined;
} | {
    status: string;
    database: boolean;
    error: string;
}>;
export declare function closeDatabaseConnection(): Promise<void>;
