// Custom error class
export class ApiError extends Error {
    constructor(message, statusCode = 500, isOperational = true, code) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
// Error handler middleware
export const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let code;
    // Handle custom API errors
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code;
    }
    // Handle validation errors
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
    }
    // Handle database errors
    else if (err.name === 'DatabaseError') {
        statusCode = 500;
        message = 'Database Error';
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    // Handle token expiration
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    // Log unexpected errors
    else {
        console.error('Unexpected error:', err);
        message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
    }
    // Security headers for error responses
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
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
