import { useState, useEffect } from 'react';
import API from '../api/client';

export function useStores() {
  const [stores, setStores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.getStores({ limit: 100 });
      setStores(res.data || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return { stores, loading, error, refetch: fetchStores };
}
