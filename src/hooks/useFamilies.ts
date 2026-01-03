import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useFamilies() {
  const { user } = useAuth();
  const [families, setFamilies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFamilies = useCallback(async () => {
    if (!user?.associationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.getFamilies(user.associationId);
      setFamilies(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load families');
    } finally {
      setIsLoading(false);
    }
  }, [user?.associationId]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  const checkCooldown = async (id: string, days: number = 30) => {
    try {
      const result = await api.checkFamilyCooldown(id, days);
      return result.isEligible;
    } catch (err: any) {
      toast.error(err.message || 'Failed to check cooldown');
      return false;
    }
  };

  const deleteFamily = async (id: string) => {
    try {
      await api.deleteFamily(id);
      setFamilies(prev => prev.filter(f => f.id !== id));
      toast.success('Family deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete family');
    }
  };

  const eligibleCount = families.filter(f => f.status === 'ELIGIBLE').length;
  const cooldownCount = families.filter(f => f.status === 'COOLDOWN').length;
  const totalMembers = families.reduce((sum, f) => sum + (f.memberCount || 0), 0);

  return {
    families,
    isLoading,
    error,
    eligibleCount,
    cooldownCount,
    totalMembers,
    checkCooldown,
    deleteFamily,
    refetch: fetchFamilies,
  };
}
