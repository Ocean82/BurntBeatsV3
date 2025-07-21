export const serverTimingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    req.timing = {
        startTime,
        metrics: new Map()
    };
    // Add timing utility methods to request
    req.timing.addMetric = (name, duration, description) => {
        req.timing.metrics.set(name, { name, duration, description });
    };
    req.timing.startTimer = (name) => {
        const timerStart = Date.now();
        return {
            end: (description) => {
                const duration = Date.now() - timerStart;
                req.timing.addMetric(name, duration, description);
            }
        };
    };
    // Override res.end to add Server-Timing header
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        if (req.timing) {
            // Add total request duration
            const totalDuration = Date.now() - req.timing.startTime;
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
//# sourceMappingURL=server-timing.js.map