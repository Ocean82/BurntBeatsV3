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

router.get('/health', (req: Request, res: Response) => {
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
});

router.get('/ready', (req: Request, res: Response) => {
  res.json({ status: 'ready', message: 'Service is ready to accept requests' });
});

export default router;