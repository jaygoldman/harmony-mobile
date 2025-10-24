import { useCallback, useEffect, useRef, useState } from 'react';

type FetchMode = 'initial' | 'refresh';

export interface AsyncListState<T> {
  data: T[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  reload: () => Promise<void>;
  refresh: () => Promise<void>;
  setData: (updater: (current: T[]) => T[]) => void;
}

export const useAsyncList = <T>(loader: () => Promise<T[]>): AsyncListState<T> => {
  const [data, setDataInternal] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (mode: FetchMode) => {
      if (mode === 'initial') {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      try {
        const result = await loader();
        if (mountedRef.current) {
          setDataInternal(result);
        }
      } catch (err) {
        if (mountedRef.current) {
          const message = err instanceof Error ? err.message : 'Unable to load data.';
          setError(message);
        }
      } finally {
        if (mountedRef.current) {
          if (mode === 'initial') {
            setLoading(false);
          } else {
            setRefreshing(false);
          }
        }
      }
    },
    [loader]
  );

  useEffect(() => {
    load('initial');
  }, [load]);

  const updateData = useCallback((updater: (current: T[]) => T[]) => {
    setDataInternal((current) => updater(current));
  }, []);

  return {
    data,
    loading,
    refreshing,
    error,
    reload: () => load('initial'),
    refresh: () => load('refresh'),
    setData: updateData,
  };
};
