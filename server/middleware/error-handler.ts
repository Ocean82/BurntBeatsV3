import { Request, Response, NextFunction } from 'express';

// Core error classes
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public details?: any;

  constructor(
    message: string, 
    statusCode: number = 500, 
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Type guard for Error instances
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Type guard for ApiError instances
function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// Safe error message extraction
function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  return 'Unknown error occurred';
}

// Safe error stack extraction
function getErrorStack(error: unknown): string | undefined {
  if (isError(error)) {
    return error.stack;
  }
  return undefined;
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
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
  } else if (isError(err)) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      res.status(500).json({
        success: false,
        error: {
          message: isDevelopment ? err.message : 'Internal server error',
          details: isDevelopment ? err.stack : 'Something went wrong on our end',
          timestamp: new Date().toISOString()
        }
      });
  } else {
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
};

// Global error handler for uncaught exceptions
export const handleUncaughtException = (error: unknown): void => {
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
export const handleUnhandledRejection = (reason: unknown, promise: Promise<any>): void => {
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
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
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
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};