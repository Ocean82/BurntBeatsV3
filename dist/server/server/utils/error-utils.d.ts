/**
 * Type guard to check if value is an Error instance
 */
export declare function isError(value: unknown): value is Error;
/**
 * Type guard to check if value is an object with message property
 */
export declare function isErrorLike(value: unknown): value is {
    message: string;
};
/**
 * Safely extract error message from unknown error type
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Safely extract error stack from unknown error type
 */
export declare function getErrorStack(error: unknown): string | undefined;
/**
 * Create a standardized error response object
 */
export declare function createErrorResponse(error: unknown, isDevelopment?: boolean): {
    success: boolean;
    error: {
        message: string;
        details: string;
        timestamp: string;
        type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    };
};
/**
 * Log error with consistent format
 */
export declare function logError(error: unknown, context?: string): void;
/**
 * Handle async function errors safely
 */
export declare function safeAsync<T>(fn: () => Promise<T>): Promise<{
    success: true;
    data: T;
} | {
    success: false;
    error: string;
}>;
/**
 * Wrap sync function with error handling
 */
export declare function safeSync<T>(fn: () => T): {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
};
