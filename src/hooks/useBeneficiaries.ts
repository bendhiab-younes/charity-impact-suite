import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useBeneficiaries() {
  const { user } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBeneficiaries = useCallback(async () => {
    if (!user?.associationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.getBeneficiaries(user.associationId);
      setBeneficiaries(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load beneficiaries');
    } finally {
      setIsLoading(false);
    }
  }, [user?.associationId]);

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.updateBeneficiaryStatus(id, status);
      setBeneficiaries(prev => 
        prev.map(b => b.id === id ? { ...b, status } : b)
      );
      toast.success(`Beneficiary status updated to ${status.toLowerCase().replace('_', ' ')}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const eligibleCount = beneficiaries.filter(b => b.status === 'ELIGIBLE').length;
  const pendingCount = beneficiaries.filter(b => b.status === 'PENDING_REVIEW').length;
  const ineligibleCount = beneficiaries.filter(b => b.status === 'INELIGIBLE').length;

  return {
    beneficiaries,
    isLoading,
    error,
    eligibleCount,
    pendingCount,
    ineligibleCount,
    updateStatus,
    refetch: fetchBeneficiaries,
  };
}
