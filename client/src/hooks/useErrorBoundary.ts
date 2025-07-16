
import { useState, useCallback } from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: Date;
  context?: string;
}

export function useErrorBoundary() {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const captureError = useCallback((error: Error, context?: string) => {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      context,
    };

    setError(errorInfo);

    // Log to console for development
    console.error('Error captured:', errorInfo);

    // In production, you might want to send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorTracking(errorInfo);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const throwError = useCallback((message: string, context?: string) => {
    const error = new Error(message);
    captureError(error, context);
    throw error;
  }, [captureError]);

  return {
    error,
    captureError,
    clearError,
    throwError,
    hasError: error !== null,
  };
}
