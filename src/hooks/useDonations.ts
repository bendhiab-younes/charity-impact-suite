import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

  const approveDonation = async (id: string) => {
    try {
      await api.approveDonation(id);
      setDonations(prev => 
        prev.map(d => d.id === id ? { ...d, status: 'APPROVED' } : d)
      );
      toast.success('Donation approved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve donation');
    }
  };

  const rejectDonation = async (id: string) => {
    try {
      await api.rejectDonation(id);
      setDonations(prev => 
        prev.map(d => d.id === id ? { ...d, status: 'REJECTED' } : d)
      );
      toast.error('Donation rejected');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject donation');
    }
  };

  const completeDonation = async (id: string) => {
    try {
      await api.completeDonation(id);
      setDonations(prev => 
        prev.map(d => d.id === id ? { ...d, status: 'COMPLETED' } : d)
      );
      toast.success('Donation marked as completed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete donation');
    }
  };

  const pendingCount = donations.filter(d => d.status === 'PENDING').length;
  const completedCount = donations.filter(d => d.status === 'COMPLETED').length;
  const approvedCount = donations.filter(d => d.status === 'APPROVED').length;

  return {
    donations,
    isLoading,
    error,
    pendingCount,
    completedCount,
    approvedCount,
    approveDonation,
    rejectDonation,
    completeDonation,
    refetch: fetchDonations,
  };
}
