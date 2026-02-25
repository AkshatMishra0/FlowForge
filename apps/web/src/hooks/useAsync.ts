'use client';

import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options?: UseAsyncOptions<T>
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null });
      
      try {
        const data = await asyncFunction(...args);
        setState({ data, loading: false, error: null });
        options?.onSuccess?.(data);
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('An error occurred');
        setState({ data: null, loading: false, error: err });
        options?.onError?.(err);
        throw error;
      }
    },
    [asyncFunction, options]
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
