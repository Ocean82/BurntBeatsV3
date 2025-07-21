// Error utility functions for consistent error handling across the application
/**
 * Type guard to check if value is an Error instance
 */
export function isError(value) {
    return value instanceof Error;
}
/**
 * Type guard to check if value is an object with message property
 */
export function isErrorLike(value) {
    return (value !== null &&
        typeof value === 'object' &&
        'message' in value &&
        typeof value.message === 'string');
}
/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error) {
    if (isError(error)) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (isErrorLike(error)) {
        return error.message;
    }
    if (error === null || error === undefined) {
        return 'Unknown error: null or undefined';
    }
    // Last resort: convert to string
    try {
        return String(error);
    }
    catch {
        return 'Unknown error: unable to convert to string';
    }
}
/**
 * Safely extract error stack from unknown error type
 */
export function getErrorStack(error) {
    if (isError(error) && error.stack) {
        return error.stack;
    }
    return undefined;
}
/**
 * Create a standardized error response object
 */
export function createErrorResponse(error, isDevelopment = false) {
    return {
        success: false,
        error: {
            message: getErrorMessage(error),
            details: isDevelopment ? getErrorStack(error) || 'No stack trace available' : 'Internal server error',
            timestamp: new Date().toISOString(),
            type: typeof error
        }
    };
}
/**
 * Log error with consistent format
 */
export function logError(error, context) {
    const logData = {
        message: getErrorMessage(error),
        stack: getErrorStack(error),
        context: context || 'Unknown context',
        timestamp: new Date().toISOString(),
        errorType: typeof error,
        isError: isError(error)
    };
    console.error('[ERROR]', logData);
}
/**
 * Handle async function errors safely
 */
export function safeAsync(fn) {
    return fn()
        .then((data) => ({ success: true, data }))
        .catch((error) => ({ success: false, error: getErrorMessage(error) }));
}
/**
 * Wrap sync function with error handling
 */
export function safeSync(fn) {
    try {
        const data = fn();
        return { success: true, data };
    }
    catch (error) {
        return { success: false, error: getErrorMessage(error) };
    }
}
