import { Request, Response, NextFunction } from 'express';
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const healthCheckLogger: (req: Request, res: Response, next: NextFunction) => void;
export { healthCheckLogger };
