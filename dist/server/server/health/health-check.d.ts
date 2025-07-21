import { Request, Response } from 'express';
declare const router: import("express-serve-static-core").Router;
interface HealthCheckResult {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    details?: any;
}
export declare class HealthChecker {
    private static instance;
    private lastHealthCheck;
    private healthCheckInterval;
    private constructor();
    static getInstance(): HealthChecker;
    getLastHealthCheck(): HealthCheckResult | null;
    startPeriodicHealthChecks(): void;
    stopPeriodicHealthChecks(): void;
    private performHealthCheck;
}
export declare const healthCheckHandler: (req: Request, res: Response) => void;
export default router;
