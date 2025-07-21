"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.AppError = void 0;
exports.errorHandler = errorHandler;
exports.notFound = notFound;
const zod_1 = require("zod");
class AppError extends Error {
    status;
    isOperational;
    constructor(message, status = 500, isOperational = true) {
        super(message);
        this.status = status;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (error, req, res, next) => {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    // Log detailed error information
    console.error(`[${new Date().toISOString()}] Error ${requestId}:`, {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        headers: {
            'user-agent': req.headers['user-agent'],
            'content-type': req.headers['content-type'],
            'accept': req.headers.accept
        },
        body: req.body,
        query: req.query,
        params: req.params
    });
    // Prevent hanging requests
    if (res.headersSent) {
        return next(error);
    }
    // Handle Zod validation errors
    if (error instanceof zod_1.ZodError) {
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
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
function generateRequestId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
function errorHandler(err, req, res, next) {
    // Log the error
    console.error('API Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        headers: req.headers
    });
    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let details = err.details || undefined;
    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        details = err.message;
    }
    else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }
    // Ensure consistent response format
    res.status(statusCode).json({
        success: false,
        error: message,
        details,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.path
    });
}
function notFound(req, res) {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        details: `Cannot ${req.method} ${req.path}`,
        statusCode: 404,
        timestamp: new Date().toISOString()
    });
}
//# sourceMappingURL=error-handler.js.map