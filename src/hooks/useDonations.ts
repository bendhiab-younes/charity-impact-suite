import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * useDonations - Hook for managing aid OUT to beneficiaries
 * 
 * In the new schema:
 * - Donation = Aid given OUT to beneficiaries (deducts from budget)
 * - Contribution = Money received IN from donors (adds to budget)
 * 
 * This hook handles Donations (Aid OUT)
 */
export function useDonations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = useCallback(async () => {
    if (!user?.associationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.getDonations(user.associationId);
      setDonations(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load donations');
    } finally {
      setIsLoading(false);
    }
  }, [user?.associationId]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const createDonation = async (data: {
    beneficiaryId: string;
    amount: number;
    aidType?: string;
    notes?: string;
  }) => {
    if (!user?.associationId) {
      toast.error('No association selected');
      return;
    }

    try {
      const donation = await api.createDonation({
        ...data,
        associationId: user.associationId,
      });
      setDonations(prev => [donation, ...prev]);
      toast.success('Aid given successfully');
      return donation;
    } catch (err: any) {
      toast.error(err.message || 'Failed to give aid');
      throw err;
    }
  };

  const cancelDonation = async (id: string) => {
    try {
      await api.cancelDonation(id);
      setDonations(prev => 
        prev.map(d => d.id === id ? { ...d, status: 'CANCELLED' } : d)
      );
      toast.success('Donation cancelled and budget restored');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel donation');
    }
  };

  const pendingCount = donations.filter(d => d.status === 'PENDING').length;
  const completedCount = donations.filter(d => d.status === 'COMPLETED').length;
  const cancelledCount = donations.filter(d => d.status === 'CANCELLED').length;
  const totalAmount = donations
    .filter(d => d.status === 'COMPLETED')
    .reduce((sum, d) => sum + d.amount, 0);

  return {
    donations,
    isLoading,
    error,
    pendingCount,
    completedCount,
    cancelledCount,
    totalAmount,
    createDonation,
    cancelDonation,
    refetch: fetchDonations,
  };
}
