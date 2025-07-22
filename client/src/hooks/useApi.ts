import { useState, useCallback } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (url: string, options: ApiOptions = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Handle FormData vs JSON content
      const isFormData = options.body instanceof FormData;
      const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers
      };

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        credentials: 'include', // Include session cookies for authentication
        body: isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined)
      });

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorData.details || errorMessage;
        } catch {
          // Use default error message if JSON parsing fails
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Check if backend returned an error within a 200 response
      if (data.success === false || data.error) {
        throw new Error(data.error || data.message || 'Operation failed');
      }

      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      console.error('API Error:', error);
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isLoading: state.loading,
    hasError: !!state.error,
    isSuccess: !state.loading && !state.error && !!state.data
  };
}