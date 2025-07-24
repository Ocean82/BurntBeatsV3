import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { db } from './db';

/**
 * Health check endpoint handler
 */
export async function healthCheck(req: Request, res: Response) {
    try {
        // Basic system information
        const systemInfo = {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpus: os.cpus().length,
            freeMemory: os.freemem(),
            totalMemory: os.totalmem(),
            platform: process.platform,
            nodeVersion: process.version,
        };

        // Check database connection
        let dbStatus = 'unknown';
        try {
            // Simple query to check if database is responsive
            await db.execute(sql`SELECT 1`);
            dbStatus = 'connected';
        } catch (error) {
            dbStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
        }

        // Check storage directories
        const storageDirectories = [
            'storage/midi/generated',
            'storage/midi/user-uploads',
            'storage/voices',
            'storage/models',
            'storage/temp'
        ];

        const storageStatus = storageDirectories.map(dir => {
            const fullPath = path.join(process.cwd(), dir);
            return {
                directory: dir,
                exists: fs.existsSync(fullPath),
                writable: isDirectoryWritable(fullPath)
            };
        });

        // Return health status
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || 'unknown',
            environment: process.env.NODE_ENV || 'development',
            system: systemInfo,
            database: {
                status: dbStatus,
                url: maskDatabaseUrl(process.env.DATABASE_URL || 'not_set')
            },
            storage: storageStatus
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}

/**
 * Check if a directory is writable
 */
function isDirectoryWritable(directory: string): boolean {
    if (!fs.existsSync(directory)) {
        return false;
    }

    try {
        // Try to write a temporary file
        const testFile = path.join(directory, `.write-test-${Date.now()}`);
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Mask sensitive information in database URL
 */
function maskDatabaseUrl(url: string): string {
    if (!url || url === 'not_set') {
        return url;
    }

    try {
        // Replace password with asterisks
        return url.replace(/\/\/([^:]+):([^@]+)@/, '//\\1:********@');
    } catch {
        return 'invalid_url_format';
    }
}

// Import SQL tag for raw queries
import { sql } from 'drizzle-orm';