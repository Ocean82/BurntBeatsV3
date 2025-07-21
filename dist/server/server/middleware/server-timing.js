export const serverTimingMiddleware = (req, res, next) => {
    const timingContext = {
        startTime: performance.now(),
        metrics: new Map()
    };
    const addMetric = (name, duration, description) => {
        timingContext.metrics.set(name, { name, duration, description });
    };
    const startTimer = (name) => {
        const start = performance.now();
        return {
            end: (description) => {
                const duration = performance.now() - start;
                addMetric(name, duration, description);
            }
        };
    };
    req.timing = Object.assign(timingContext, {
        addMetric,
        startTimer
    });
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
