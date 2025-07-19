import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
  timestamp: string;
  requestId?: string;
  stack?: string;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly isOperational: boolean;

  constructor(message: string, status: number = 500, isOperational: boolean = true) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();

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
    const errorResponse: ErrorResponse = {
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
    const errorResponse: ErrorResponse = {
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
    const errorResponse: ErrorResponse = {
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
    const errorResponse: ErrorResponse = {
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
    const errorResponse: ErrorResponse = {
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
  const errorResponse: ErrorResponse = {
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

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Already exported above as named exports
import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  details?: string;
}

export function errorHandler(err: ApiError, req: Request, res: Response, next: NextFunction) {
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
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'CastError') {
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

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    details: `Cannot ${req.method} ${req.path}`,
    statusCode: 404,
    timestamp: new Date().toISOString()
  });
}
