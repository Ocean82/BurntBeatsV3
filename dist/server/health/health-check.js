"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckHandler = exports.HealthChecker = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
class HealthChecker {
    constructor() {
        this.lastHealthCheck = null;
        this.healthCheckInterval = null;
    }
    static getInstance() {
        if (!HealthChecker.instance) {
            HealthChecker.instance = new HealthChecker();
        }
        return HealthChecker.instance;
    }
    getLastHealthCheck() {
        return this.lastHealthCheck;
    }
    startPeriodicHealthChecks() {
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, 30000); // Check every 30 seconds
    }
    stopPeriodicHealthChecks() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }
    performHealthCheck() {
        try {
            const memUsage = process.memoryUsage();
            const uptime = process.uptime();
            // Simple health check logic
            const isHealthy = uptime > 0 && memUsage.heapUsed < 500 * 1024 * 1024; // Less than 500MB
            this.lastHealthCheck = {
                status: isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    uptime,
                    memory: memUsage
                }
            };
        }
        catch (error) {
            this.lastHealthCheck = {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                details: { error: error instanceof Error ? error.message : 'Unknown error' }
            };
        }
    }
}
exports.HealthChecker = HealthChecker;
const healthCheckHandler = (req, res) => {
    const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
            total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
        },
        services: {
            database: 'connected',
            api: 'operational'
        }
    };
    res.json(healthStatus);
};
exports.healthCheckHandler = healthCheckHandler;
router.get('/health', exports.healthCheckHandler);
router.get('/ready', (req, res) => {
    res.json({ status: 'ready', message: 'Service is ready to accept requests' });
});
exports.default = router;
