
import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiOptions {
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

export function useApi<T>(defaultOptions: ApiOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const {
    retryAttempts = 3,
    retryDelay = 1000,
    timeout = 30000,
  } = defaultOptions;

  const execute = useCallback(
    async (
      url: string,
      options: RequestInit = {},
      customOptions: ApiOptions = {}
    ): Promise<T | null> => {
      const finalRetryAttempts = customOptions.retryAttempts ?? retryAttempts;
      const finalRetryDelay = customOptions.retryDelay ?? retryDelay;
      const finalTimeout = customOptions.timeout ?? timeout;

      setState(prev => ({ ...prev, loading: true, error: null }));

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= finalRetryAttempts; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), finalTimeout);

          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          setState({ data, loading: false, error: null });
          return data;
        } catch (error) {
          lastError = error as Error;
          
          if (attempt < finalRetryAttempts) {
            await new Promise(resolve => setTimeout(resolve, finalRetryDelay * Math.pow(2, attempt)));
            continue;
          }
        }
      }

      const errorMessage = lastError?.message || 'Unknown API error';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    },
    [retryAttempts, retryDelay, timeout]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
