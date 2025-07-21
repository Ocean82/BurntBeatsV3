export const serverTimingMiddleware = (req, res, next) => {
    req.timing = {
        startTime: Date.now(),
        metrics: new Map(),
        addMetric: (name, duration, description) => {
            const metric = {
                name,
                duration: duration || Date.now() - req.timing.startTime,
                description
            };
            req.timing.metrics.set(name, metric);
        },
        startTimer: (name) => {
            const startTime = Date.now();
            return {
                end: (description) => {
                    const duration = Date.now() - startTime;
                    req.timing.addMetric(name, duration, description);
                }
            };
        }
    };
    // Override res.end to add Server-Timing header
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        if (req.timing) {
            // Add total request duration
            const totalDuration = performance.now() - req.timing.startTime;
            req.timing.addMetric('total', totalDuration, 'Total request duration');
            // Build Server-Timing header
            const timingHeader = Array.from(req.timing.metrics.values())
                .map(metric => {
                let header = metric.name;
                if (metric.duration !== undefined) {
                    header += `;dur=${metric.duration}`;
                }
                if (metric.description) {
                    header += `;desc="${metric.description}"`;
                }
                return header;
            })
                .join(', ');
            if (timingHeader) {
                res.setHeader('Server-Timing', timingHeader);
            }
        }
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
