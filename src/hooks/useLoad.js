// Loads data when a screen opens (and every time you come back to it).
// Gives: data, loading, error, reload(), plus pull-to-refresh helpers.
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export default function useLoad(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const alive = useRef(true);

  const run = useCallback(async (mode = 'load') => {
    if (mode === 'refresh') setRefreshing(true);
    try {
      const result = await loader();
      if (alive.current) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (alive.current) setError(e.message || 'Something went wrong.');
    } finally {
      if (alive.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      alive.current = true;
      run();
      return () => {
        alive.current = false;
      };
    }, [run])
  );

  return { data, setData, loading, refreshing, error, reload: () => run('load'), refresh: () => run('refresh') };
}
