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
export declare const serverTimingMiddleware: (req: Request, res: Response, next: NextFunction) => void;
declare module 'express-serve-static-core' {
    interface Request {
        timing?: TimingContext & {
            addMetric: (name: string, duration?: number, description?: string) => void;
            startTimer: (name: string) => {
                end: (description?: string) => void;
            };
        };
    }
}
export {};
