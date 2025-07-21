import { Request, Response, NextFunction } from 'express';
export declare class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    code?: string;
    details?: any;
    constructor(message: string, statusCode?: number, isOperational?: boolean, code?: string, details?: any);
}
export declare class ValidationError extends ApiError {
    constructor(message: string);
}
export declare class NotFoundError extends ApiError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends ApiError {
    constructor(message?: string);
}
export declare function errorHandler(err: ApiError, req: Request, res: Response, next: NextFunction): void;
export declare const handleUncaughtException: (error: unknown) => void;
export declare const handleUnhandledRejection: (reason: unknown, promise: Promise<any>) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
