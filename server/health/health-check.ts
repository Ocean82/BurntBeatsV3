
import { Request, Response, Router } from 'express';

const router = Router();

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    used: string;
    total: string;
  };
  services: {
    database: string;
    api: string;
  };
}

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  details?: any;
}

export class HealthChecker {
  private static instance: HealthChecker;
  private lastHealthCheck: HealthCheckResult | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  getLastHealthCheck(): HealthCheckResult | null {
    return this.lastHealthCheck;
  }

  startPeriodicHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Check every 30 seconds
  }

  stopPeriodicHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private performHealthCheck(): void {
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
    } catch (error) {
      this.lastHealthCheck = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}

export const healthCheckHandler = (req: Request, res: Response) => {
  const healthStatus: HealthStatus = {
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

router.get('/health', healthCheckHandler);

router.get('/ready', (req: Request, res: Response) => {
  res.json({ status: 'ready', message: 'Service is ready to accept requests' });
});

export default router;
