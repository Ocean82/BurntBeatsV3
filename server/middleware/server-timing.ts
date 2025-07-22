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
  (req as any).timing = {
    startTime: Date.now(),
    metrics: new Map(),
    addMetric: (name: string, duration?: number, description?: string) => {
      const metric = {
        name,
        duration: duration || Date.now() - (req as any).timing.startTime,
        description
      };
      (req as any).timing.metrics.set(name, metric);
    },
    startTimer: (name: string) => {
      const startTime = Date.now();
      return {
        end: (description?: string) => {
          const duration = Date.now() - startTime;
          (req as any).timing.addMetric(name, duration, description);
        }
      };
    }
  };

  // Override res.end to add Server-Timing header
  const originalEnd = res.end;
  res.end = function(this: any, chunk?: any, encoding?: any) {
    if ((req as any).timing) {
      // Add total request duration
      const totalDuration = performance.now() - (req as any).timing.startTime;
      (req as any).timing.addMetric('total', totalDuration, 'Total request duration');

      // Build Server-Timing header
      const timingHeader = Array.from((req as any).timing.metrics.values())
        .map((metric) => {
          const typedMetric = metric as ServerTiming;
          let header = typedMetric.name;
          if (typedMetric.duration !== undefined) {
            header += `;dur=${typedMetric.duration}`;
          }
          if (typedMetric.description) {
            header += `;desc="${typedMetric.description}"`;
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