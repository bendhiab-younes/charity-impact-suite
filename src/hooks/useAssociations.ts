import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useAssociations() {
  const [associations, setAssociations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const data = await api.getAssociations();
        setAssociations(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssociations();
  }, []);

  return { associations, isLoading, error };
}
