// Core error classes
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
// Type guard for Error instances
function isError(error) {
    return error instanceof Error;
}
// Type guard for ApiError instances
function isApiError(error) {
    return error instanceof ApiError;
}
// Safe error message extraction
function getErrorMessage(error) {
    if (isError(error)) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return 'Unknown error occurred';
}
// Safe error stack extraction
function getErrorStack(error) {
    if (isError(error)) {
        return error.stack;
    }
    return undefined;
}
export class ValidationError extends ApiError {
    constructor(message) {
        super(message, 400);
    }
}
export class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
export class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
    }
}
export function errorHandler(err, req, res, next) {
    // Log error for debugging with type safety
    console.error('Error Handler - Full Error:', {
        message: getErrorMessage(err),
        stack: getErrorStack(err),
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        errorType: typeof err,
        isError: isError(err),
        isApiError: isApiError(err)
    });
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.code,
                details: err.details,
                timestamp: new Date().toISOString()
            },
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }
    else if (isError(err)) {
        const isDevelopment = process.env.NODE_ENV === 'development';
        res.status(500).json({
            success: false,
            error: {
                message: isDevelopment ? err.message : 'Internal server error',
                details: isDevelopment ? err.stack : 'Something went wrong on our end',
                timestamp: new Date().toISOString()
            }
        });
    }
    else {
        console.error('Unexpected error:', err);
        const isDevelopment = process.env.NODE_ENV === 'development';
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                details: isDevelopment ? `Unknown error type: ${typeof err}` : 'Something went wrong on our end',
                timestamp: new Date().toISOString()
            }
        });
    }
}
;
// Global error handler for uncaught exceptions
export const handleUncaughtException = (error) => {
    console.error('[CRITICAL] Uncaught Exception:', {
        message: getErrorMessage(error),
        stack: getErrorStack(error),
        timestamp: new Date().toISOString(),
        errorType: typeof error
    });
    // In production, we might want to restart the process
    if (process.env.NODE_ENV === 'production') {
        console.error('Process will exit due to uncaught exception');
        process.exit(1);
    }
};
// Global error handler for unhandled promise rejections
export const handleUnhandledRejection = (reason, promise) => {
    console.error('[CRITICAL] Unhandled Promise Rejection:', {
        reason: getErrorMessage(reason),
        stack: getErrorStack(reason),
        promise: promise.toString(),
        timestamp: new Date().toISOString(),
        reasonType: typeof reason
    });
    // In production, we might want to restart the process
    if (process.env.NODE_ENV === 'production') {
        console.error('Process will exit due to unhandled promise rejection');
        process.exit(1);
    }
};
// Async wrapper with proper error handling
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.error('AsyncHandler caught error:', {
                message: getErrorMessage(error),
                stack: getErrorStack(error),
                url: req.url,
                method: req.method,
                timestamp: new Date().toISOString()
            });
            next(error);
        });
    };
};
// Not found handler
export const notFoundHandler = (req, res, next) => {
    const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
};
