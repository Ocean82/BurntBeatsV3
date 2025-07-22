"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourceMonitor = exports.productionConfig = void 0;
const server_1 = require("./server");
exports.productionConfig = {
    ...server_1.serverConfig,
    // Enhanced security settings
    security: {
        ...server_1.serverConfig.security,
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "https://api.stripe.com"],
                    mediaSrc: ["'self'", "blob:"],
                    objectSrc: ["'none'"],
                    frameSrc: ["'self'", "https://js.stripe.com"]
                }
            },
            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: {
                policy: 'cross-origin'
            },
        },
        rateLimiting: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // requests per window
            standardHeaders: true,
            legacyHeaders: false,
            message: {
                error: 'Too many requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: 900
            }
        }
    },
    // Server timeouts and limits
    server: {
        timeout: 30000, // 30 seconds
        keepAliveTimeout: 65000, // 65 seconds
        headersTimeout: 66000, // 66 seconds
        maxHeaderSize: 16384, // 16KB
        requestTimeout: 30000 // 30 seconds
    },
    // Database connection pool settings
    database: {
        maxConnections: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        acquireTimeoutMillis: 60000
    },
    // File upload limits
    upload: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        maxFiles: 10,
        allowedMimeTypes: [
            'audio/mpeg',
            'audio/wav',
            'audio/x-wav',
            'audio/flac',
            'audio/ogg',
            'audio/aac',
            'audio/mp4',
            'audio/webm'
        ]
    },
    // Caching configuration
    cache: {
        staticFiles: {
            maxAge: process.env.NODE_ENV === 'production' ? 86400000 : 0, // 24 hours in prod
            etag: true,
            lastModified: true,
            immutable: false
        },
        api: {
            maxAge: 300000, // 5 minutes for API responses
            staleWhileRevalidate: 60000 // 1 minute
        }
    },
    // Memory management
    memory: {
        heapWarningThreshold: 0.8, // 80% of max heap
        cleanupInterval: 60000, // 1 minute
        tempFileCleanup: 300000 // 5 minutes
    },
    // Monitoring and health checks
    monitoring: {
        healthCheckInterval: 30000, // 30 seconds
        metricsCollection: true,
        performanceTracking: true
    }
};
// Resource monitoring
exports.resourceMonitor = {
    checkMemoryUsage: () => {
        const usage = process.memoryUsage();
        const threshold = exports.productionConfig.memory.heapWarningThreshold;
        if (usage.heapUsed / usage.heapTotal > threshold) {
            console.warn(`[MEMORY WARNING] Heap usage: ${Math.round((usage.heapUsed / usage.heapTotal) * 100)}%`);
            if (global.gc) {
                global.gc();
                console.log('[MEMORY] Manual garbage collection triggered');
            }
        }
        return {
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
            external: Math.round(usage.external / 1024 / 1024),
            rss: Math.round(usage.rss / 1024 / 1024)
        };
    },
    startMonitoring: () => {
        setInterval(() => {
            const memory = exports.resourceMonitor.checkMemoryUsage();
            console.log(`[MEMORY] Heap: ${memory.heapUsed}MB/${memory.heapTotal}MB, RSS: ${memory.rss}MB`);
        }, exports.productionConfig.monitoring.healthCheckInterval);
    }
};
exports.default = exports.productionConfig;
