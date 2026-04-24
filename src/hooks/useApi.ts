import { useState, useCallback } from 'react';

/**
 * Generic type for the API service function
 * Represents any async function that takes optional parameters and returns data
 */
type ApiServiceFunction<T> = (...args: any[]) => Promise<T>;

/**
 * Return type for the useApi hook
 */
interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<void>;
}

/**
 * Custom React hook for handling API calls
 * 
 * @param apiFunction - The API service function to execute
 * @returns Object containing data, loading state, error, and execute function
 * 
 * @example
 * const { data, loading, error, execute } = useApi(ProjectService.getAllProjects);
 * 
 * const handleFetch = async () => {
 *   await execute();
 * };
 */
function useApi<T>(apiFunction: ApiServiceFunction<T>): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return {
    data,
    loading,
    error,
    execute,
  };
}

export default useApi;
