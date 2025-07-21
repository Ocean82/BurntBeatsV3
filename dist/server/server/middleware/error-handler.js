// Enhanced API Error class
export class ApiError extends Error {
    constructor(message, statusCode = 500, isOperational = true, code, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
// Enhanced error handling middleware with detailed logging
// NOTE: This should be the last middleware in the chain
export const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error('Error Handler - Full Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    // Handle known ApiError instances
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.code,
                details: err.details,
                timestamp: new Date().toISOString()
            }
        });
        return;
    }
    // Default error response for unknown errors
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
        success: false,
        error: {
            message: isDevelopment ? err.message : 'Internal server error',
            details: isDevelopment ? err.stack : 'Something went wrong on our end',
            timestamp: new Date().toISOString()
        }
    });
};
// Not found handler
export const notFoundHandler = (req, res, next) => {
    const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
};
// Async error wrapper
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
