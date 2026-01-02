import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useRules() {
  const { user } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    if (!user?.associationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.getRules(user.associationId);
      setRules(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load rules');
    } finally {
      setIsLoading(false);
    }
  }, [user?.associationId]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const toggleRule = async (id: string) => {
    try {
      const rule = rules.find(r => r.id === id);
      await api.toggleRule(id);
      setRules(prev => 
        prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
      );
      toast.success(`Rule "${rule?.name}" ${rule?.isActive ? 'disabled' : 'enabled'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle rule');
    }
  };

  const activeCount = rules.filter(r => r.isActive).length;
  const inactiveCount = rules.filter(r => !r.isActive).length;

  return {
    rules,
    isLoading,
    error,
    activeCount,
    inactiveCount,
    toggleRule,
    refetch: fetchRules,
  };
}
