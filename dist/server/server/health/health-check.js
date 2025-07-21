import { Router } from 'express';
const router = Router();
router.get('/health', (req, res) => {
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
});
router.get('/ready', (req, res) => {
    res.json({ status: 'ready', message: 'Service is ready to accept requests' });
});
export default router;
