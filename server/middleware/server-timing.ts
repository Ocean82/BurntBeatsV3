import { Request, Response, NextFunction } from 'express';

interface ServerTiming {
  name: string;
  duration?: number;
  description?: string;
}

interface TimingContext {
  startTime: number;
  metrics: Map<string, ServerTiming>;
}

declare global {
  namespace Express {
    interface Request {
      timing?: TimingContext;
    }
  }
}

export const serverTimingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const timingContext = {
    startTime: performance.now(),
    metrics: new Map()
  };

  const addMetric = (name: string, duration?: number, description?: string) => {
    timingContext.metrics.set(name, { name, duration, description });
  };

  const startTimer = (name: string) => {
    const start = performance.now();
    return {
      end: (description?: string) => {
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
  res.end = function(this: any, chunk?: any, encoding?: any) {
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

// Type augmentation for timing methods
declare module 'express-serve-static-core' {
  interface Request {
    timing?: TimingContext & {
      addMetric: (name: string, duration?: number, description?: string) => void;
      startTimer: (name: string) => { end: (description?: string) => void };
    };
  }
}