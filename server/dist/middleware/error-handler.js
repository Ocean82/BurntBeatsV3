import { ZodError } from 'zod';
export class AppError extends Error {
    status;
    isOperational;
    constructor(message, status = 500, isOperational = true) {
        super(message);
        this.status = status;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
export const errorHandler = (error, req, res, next) => {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    console.error(`[${new Date().toISOString()}] Error ${requestId}:`, {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        headers: req.headers,
        body: req.body
    });
    // Handle Zod validation errors
    if (error instanceof ZodError) {
        const errorResponse = {
            error: 'Validation Error',
            message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
            status: 400,
            timestamp: new Date().toISOString(),
            requestId
        };
        res.status(400).json(errorResponse);
        return;
    }
    // Handle custom app errors
    if (error instanceof AppError) {
        const errorResponse = {
            error: 'Application Error',
            message: error.message,
            status: error.status,
            timestamp: new Date().toISOString(),
            requestId,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        };
        res.status(error.status).json(errorResponse);
        return;
    }
    // Handle database connection errors
    if (error.message.includes('ECONNREFUSED') || error.message.includes('database')) {
        const errorResponse = {
            error: 'Database Connection Error',
            message: 'Unable to connect to database. Please try again later.',
            status: 503,
            timestamp: new Date().toISOString(),
            requestId
        };
        res.status(503).json(errorResponse);
        return;
    }
    // Handle file system errors
    if (error.message.includes('ENOENT') || error.message.includes('EACCES')) {
        const errorResponse = {
            error: 'File System Error',
            message: 'File operation failed. Please check permissions.',
            status: 500,
            timestamp: new Date().toISOString(),
            requestId
        };
        res.status(500).json(errorResponse);
        return;
    }
    // Handle timeout errors
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        const errorResponse = {
            error: 'Request Timeout',
            message: 'Request took too long to process. Please try again.',
            status: 408,
            timestamp: new Date().toISOString(),
            requestId
        };
        res.status(408).json(errorResponse);
        return;
    }
    // Default error response
    const errorResponse = {
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong. Please try again later.'
            : error.message,
        status: 500,
        timestamp: new Date().toISOString(),
        requestId,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
    res.status(500).json(errorResponse);
};
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
function generateRequestId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
// Already exported above as named exports
//# sourceMappingURL=error-handler.js.map