
// Error utility functions for consistent error handling across the application

/**
 * Type guard to check if value is an Error instance
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if value is an object with message property
 */
export function isErrorLike(value: unknown): value is { message: string } {
  return (
    value !== null &&
    typeof value === 'object' &&
    'message' in value &&
    typeof (value as any).message === 'string'
  );
}

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
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
  } catch {
    return 'Unknown error: unable to convert to string';
  }
}

/**
 * Safely extract error stack from unknown error type
 */
export function getErrorStack(error: unknown): string | undefined {
  if (isError(error) && error.stack) {
    return error.stack;
  }
  return undefined;
}

/**
 * Create a standardized error response object
 */
export function createErrorResponse(error: unknown, isDevelopment: boolean = false) {
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
export function logError(error: unknown, context?: string) {
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
export function safeAsync<T>(
  fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  return fn()
    .then((data) => ({ success: true as const, data }))
    .catch((error) => ({ success: false as const, error: getErrorMessage(error) }));
}

/**
 * Wrap sync function with error handling
 */
export function safeSync<T>(
  fn: () => T
): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
