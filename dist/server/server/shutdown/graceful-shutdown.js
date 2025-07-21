import HealthChecker from '../health/health-check.js';
export class GracefulShutdown {
    constructor(server) {
        this.server = null;
        this.healthChecker = null;
        this.shutdownTimeout = null;
        this.isShuttingDown = false;
        this.server = server;
        this.healthChecker = HealthChecker.getInstance();
        this.setupSignalHandlers();
    }
    setupSignalHandlers() {
        // Handle graceful shutdown signals
        process.on('SIGTERM', () => {
            console.log('[SHUTDOWN] Received SIGTERM signal');
            this.shutdown('SIGTERM');
        });
        process.on('SIGINT', () => {
            console.log('[SHUTDOWN] Received SIGINT signal');
            this.shutdown('SIGINT');
        });
        process.on('SIGUSR2', () => {
            console.log('[SHUTDOWN] Received SIGUSR2 signal (nodemon restart)');
            this.shutdown('SIGUSR2');
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('[SHUTDOWN] Uncaught Exception:', error);
            this.forceShutdown(error instanceof Error ? error : new Error('Unknown error'));
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('[SHUTDOWN] Unhandled Rejection at:', promise, 'reason:', reason);
            this.forceShutdown(new Error(`Unhandled Rejection: ${reason}`));
        });
        // Handle warnings
        process.on('warning', (warning) => {
            console.warn('[WARNING]', warning.name, warning.message);
            if (warning.stack) {
                console.warn('[WARNING] Stack:', warning.stack);
            }
        });
    }
    async shutdown(signal) {
        if (this.isShuttingDown) {
            console.log('[SHUTDOWN] Already shutting down, ignoring signal');
            return;
        }
        this.isShuttingDown = true;
        console.log(`[SHUTDOWN] Starting graceful shutdown (${signal})`);
        // Set shutdown timeout
        this.shutdownTimeout = setTimeout(() => {
            console.error('[SHUTDOWN] Graceful shutdown timeout, forcing exit');
            process.exit(1);
        }, 10000); // 10 seconds timeout
        try {
            // Step 1: Stop accepting new connections
            if (this.server) {
                console.log('[SHUTDOWN] Closing HTTP server');
                this.server.close(() => {
                    console.log('[SHUTDOWN] HTTP server closed');
                });
            }
            // Step 2: Stop health checks
            if (this.healthChecker) {
                console.log('[SHUTDOWN] Stopping health checks');
                this.healthChecker.stopPeriodicHealthChecks();
            }
            // Step 3: Wait for active connections to finish
            await this.waitForActiveConnections();
            // Step 4: Cleanup resources
            await this.cleanup();
            console.log('[SHUTDOWN] Graceful shutdown completed');
            if (this.shutdownTimeout) {
                clearTimeout(this.shutdownTimeout);
            }
            process.exit(0);
        }
        catch (error) {
            console.error('[SHUTDOWN] Error during graceful shutdown:', error);
            this.forceShutdown(error instanceof Error ? error : new Error('Unknown shutdown error'));
        }
    }
    async waitForActiveConnections() {
        return new Promise((resolve) => {
            if (!this.server) {
                resolve();
                return;
            }
            const checkConnections = () => {
                // @ts-ignore - accessing internal property
                const connections = this.server._connections || 0;
                if (connections === 0) {
                    console.log('[SHUTDOWN] All connections closed');
                    resolve();
                }
                else {
                    console.log(`[SHUTDOWN] Waiting for ${connections} active connections`);
                    setTimeout(checkConnections, 1000);
                }
            };
            checkConnections();
        });
    }
    async cleanup() {
        console.log('[SHUTDOWN] Performing cleanup tasks');
        try {
            // Clean up temporary files
            const fs = await import('fs/promises');
            const tempDir = './storage/temp';
            try {
                const files = await fs.readdir(tempDir);
                for (const file of files) {
                    if (file.startsWith('temp_') || file.includes('_tmp')) {
                        await fs.unlink(`${tempDir}/${file}`);
                        console.log(`[CLEANUP] Removed temp file: ${file}`);
                    }
                }
            }
            catch (error) {
                console.warn('[CLEANUP] Could not clean temp files:', error);
            }
            // Clear any intervals or timeouts
            if (global.gc) {
                global.gc();
                console.log('[CLEANUP] Manual garbage collection triggered');
            }
            console.log('[SHUTDOWN] Cleanup completed');
        }
        catch (error) {
            console.error('[SHUTDOWN] Error during cleanup:', error);
        }
    }
    forceShutdown(error) {
        console.error('[SHUTDOWN] Force shutdown due to error:', error);
        if (this.shutdownTimeout) {
            clearTimeout(this.shutdownTimeout);
        }
        // Log the error for debugging
        console.error('[SHUTDOWN] Stack trace:', error.stack);
        // Force exit
        process.exit(1);
    }
}
export default GracefulShutdown;
