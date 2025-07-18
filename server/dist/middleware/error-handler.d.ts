import { Request, Response, NextFunction } from 'express';
export interface ErrorResponse {
    error: string;
    message: string;
    status: number;
    timestamp: string;
    requestId?: string;
    stack?: string;
}
export declare class AppError extends Error {
    readonly status: number;
    readonly isOperational: boolean;
    constructor(message: string, status?: number, isOperational?: boolean);
}
export declare const errorHandler: (error: Error, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
