import { useEffect, useState } from 'react';

export const useFetch = <T,>(
  fetchFn: () => Promise<any>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchFn();
        if (!result.error && isMounted) {
          setData(result.data);
        } else if (result.error && isMounted) {
          setError(result.error);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, isLoading, error };
};
