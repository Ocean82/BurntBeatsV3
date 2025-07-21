export declare const productionConfig: {
    security: {
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: string[];
                    styleSrc: string[];
                    fontSrc: string[];
                    scriptSrc: string[];
                    imgSrc: string[];
                    connectSrc: string[];
                    mediaSrc: string[];
                    objectSrc: string[];
                    frameSrc: string[];
                };
            };
            crossOriginEmbedderPolicy: boolean;
            crossOriginResourcePolicy: {
                policy: string;
            };
        };
        rateLimiting: {
            windowMs: number;
            max: number;
            standardHeaders: boolean;
            legacyHeaders: boolean;
            message: {
                error: string;
                message: string;
                retryAfter: number;
            };
        };
        rateLimit: {
            windowMs: number;
            max: number;
        };
    };
    server: {
        timeout: number;
        keepAliveTimeout: number;
        headersTimeout: number;
        maxHeaderSize: number;
        requestTimeout: number;
    };
    database: {
        maxConnections: number;
        idleTimeoutMillis: number;
        connectionTimeoutMillis: number;
        acquireTimeoutMillis: number;
    };
    upload: {
        maxFileSize: number;
        maxFiles: number;
        allowedMimeTypes: string[];
    };
    cache: {
        staticFiles: {
            maxAge: number;
            etag: boolean;
            lastModified: boolean;
            immutable: boolean;
        };
        api: {
            maxAge: number;
            staleWhileRevalidate: number;
        };
    };
    memory: {
        heapWarningThreshold: number;
        cleanupInterval: number;
        tempFileCleanup: number;
    };
    monitoring: {
        healthCheckInterval: number;
        metricsCollection: boolean;
        performanceTracking: boolean;
    };
    port: string | number;
    host: string;
    cors: {
        origin: string[];
        credentials: boolean;
    };
    limits: {
        json: string;
        urlencoded: string;
    };
    static: {
        maxAge: string;
    };
};
export declare const resourceMonitor: {
    checkMemoryUsage: () => {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
    };
    startMonitoring: () => void;
};
export default productionConfig;
