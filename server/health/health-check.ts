import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

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

export class HealthChecker {
  private static instance: HealthChecker;
  private lastHealthCheck: HealthStatus | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      const [database, filesystem, memory, stripe, storage] = await Promise.allSettled([
        this.checkDatabase(),
        this.checkFilesystem(),
        this.checkMemory(),
        this.checkStripe(),
        this.checkStorage()
      ]);

      const services = {
        database: this.resolveServiceStatus(database),
        filesystem: this.resolveServiceStatus(filesystem),
        memory: this.resolveServiceStatus(memory),
        stripe: this.resolveServiceStatus(stripe),
        storage: this.resolveServiceStatus(storage)
      };

      const overallStatus = this.determineOverallStatus(services);

      const healthStatus: HealthStatus = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        services,
        metrics: {
          memory: this.getMemoryMetrics(),
          process: this.getProcessMetrics()
        }
      };

      this.lastHealthCheck = healthStatus;

      const responseTime = Date.now() - startTime;
      console.log(`[HEALTH] Health check completed in ${responseTime}ms - Status: ${overallStatus}`);

      return healthStatus;
    } catch (error) {
      console.error('[HEALTH] Health check failed:', error);

      const errorStatus: HealthStatus = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: { status: 'down', error: 'Health check failed', lastChecked: new Date().toISOString() },
          filesystem: { status: 'down', error: 'Health check failed', lastChecked: new Date().toISOString() },
          memory: { status: 'down', error: 'Health check failed', lastChecked: new Date().toISOString() },
          stripe: { status: 'down', error: 'Health check failed', lastChecked: new Date().toISOString() },
          storage: { status: 'down', error: 'Health check failed', lastChecked: new Date().toISOString() }
        },
        metrics: {
          memory: this.getMemoryMetrics(),
          process: this.getProcessMetrics()
        }
      };

      this.lastHealthCheck = errorStatus;
      return errorStatus;
    }
  }

  private async checkDatabase(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      // Simple connection test - adjust based on your database setup
      await new Promise(resolve => setTimeout(resolve, 10)); // Simulate DB check

      return {
        status: 'up',
        responseTime: Date.now() - start,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Database connection failed',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkFilesystem(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      const testDir = './storage';
      await fs.access(testDir);

      // Test write permissions
      const testFile = path.join(testDir, 'health-check-test.tmp');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);

      return {
        status: 'up',
        responseTime: Date.now() - start,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Filesystem check failed',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkMemory(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      const usage = process.memoryUsage();
      const usagePercent = usage.heapUsed / usage.heapTotal;

      const status = usagePercent > 0.9 ? 'degraded' : 'up';

      return {
        status,
        responseTime: Date.now() - start,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Memory check failed',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkStripe(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;

      return {
        status: hasStripeKey ? 'up' : 'degraded',
        responseTime: Date.now() - start,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Stripe check failed',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkStorage(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      const directories = ['./storage/midi', './storage/voices', './storage/music'];

      for (const dir of directories) {
        await fs.access(dir);
      }

      return {
        status: 'up',
        responseTime: Date.now() - start,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Storage check failed',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private resolveServiceStatus(result: PromiseSettledResult<ServiceStatus>): ServiceStatus {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    return {
      status: 'down',
      error: result.reason?.message || 'Service check failed',
      lastChecked: new Date().toISOString()
    };
  }

  private determineOverallStatus(services: HealthStatus['services']): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Object.values(services).map(s => s.status);

    if (statuses.includes('down')) {
      return 'unhealthy';
    }

    if (statuses.includes('degraded')) {
      return 'degraded';
    }

    return 'healthy';
  }

  private getMemoryMetrics(): MemoryMetrics {
    const usage = process.memoryUsage();

    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
      usage: Math.round((usage.heapUsed / usage.heapTotal) * 100)
    };
  }

  private getProcessMetrics(): ProcessMetrics {
    return {
      uptime: Math.round(process.uptime()),
      pid: process.pid,
      cpuUsage: process.cpuUsage()
    };
  }

  startPeriodicHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.checkHealth();
    }, 30000); // Check every 30 seconds

    console.log('[HEALTH] Periodic health checks started');
  }

  stopPeriodicHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  getLastHealthCheck(): HealthStatus | null {
    return this.lastHealthCheck;
  }
}

export const healthCheckHandler = async (req: Request, res: Response): Promise<void> => {
  const healthChecker = HealthChecker.getInstance();

  try {
    const health = await healthChecker.checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    console.error('[HEALTH] Health check endpoint failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
};

export { healthCheckHandler, HealthChecker };
export default HealthChecker;