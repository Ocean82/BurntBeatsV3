import { Request, Response } from 'express';
interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    version: string;
    services: {
        database: ServiceStatus;
        filesystem: ServiceStatus;
        memory: ServiceStatus;
        stripe: ServiceStatus;
        storage: ServiceStatus;
    };
    metrics: {
        memory: MemoryMetrics;
        process: ProcessMetrics;
    };
}
interface ServiceStatus {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    error?: string;
    lastChecked: string;
}
interface MemoryMetrics {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    usage: number;
}
interface ProcessMetrics {
    uptime: number;
    pid: number;
    cpuUsage: NodeJS.CpuUsage;
}
export declare class HealthChecker {
    private static instance;
    private lastHealthCheck;
    private healthCheckInterval;
    private constructor();
    static getInstance(): HealthChecker;
    checkHealth(): Promise<HealthStatus>;
    private checkDatabase;
    private checkFilesystem;
    private checkMemory;
    private checkStripe;
    private checkStorage;
    private resolveServiceStatus;
    private determineOverallStatus;
    private getMemoryMetrics;
    private getProcessMetrics;
    startPeriodicHealthChecks(): void;
    stopPeriodicHealthChecks(): void;
    getLastHealthCheck(): HealthStatus | null;
}
export declare const healthCheckHandler: (req: Request, res: Response) => Promise<void>;
export default HealthChecker;
