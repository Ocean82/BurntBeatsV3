
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
  const startTime = Date.now();
  
  const timingContext: TimingContext & {
    addMetric: (name: string, duration?: number, description?: string) => void;
    startTimer: (name: string) => { end: (description?: string) => void };
  } = {
    startTime,
    metrics: new Map(),
    addMetric: () => {},
    startTimer: () => ({ end: () => {} })
  };

  req.timing = timingContext;

  // Add timing utility methods to request
  req.timing.addMetric = (name: string, duration?: number, description?: string) => {
    req.timing!.metrics.set(name, { name, duration, description });
  };

  req.timing.startTimer = (name: string) => {
    const timerStart = Date.now();
    return {
      end: (description?: string) => {
        const duration = Date.now() - timerStart;
        req.timing!.addMetric(name, duration, description);
      }
    };
  };

  // Override res.end to add Server-Timing header
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
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

// Type augmentation for timing methods
declare module 'express-serve-static-core' {
  interface Request {
    timing?: TimingContext & {
      addMetric: (name: string, duration?: number, description?: string) => void;
      startTimer: (name: string) => { end: (description?: string) => void };
    };
  }
}
