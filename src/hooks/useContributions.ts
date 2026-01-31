import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Contribution {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  method: string;
  notes?: string;
  donorName?: string;
  donorEmail?: string;
  approvedAt?: string;
  createdAt: string;
  donor?: {
    id: string;
    name: string;
    email: string;
  };
  association: {
    id: string;
    name: string;
  };
}

export function useContributions() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContributions = useCallback(async () => {
    if (!user?.associationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.getContributions(user.associationId);
      setContributions(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load contributions');
    } finally {
      setIsLoading(false);
    }
  }, [user?.associationId]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  const approveContribution = async (id: string) => {
    try {
      await api.approveContribution(id);
      setContributions(prev => 
        prev.map(c => c.id === id ? { ...c, status: 'APPROVED', approvedAt: new Date().toISOString() } : c)
      );
      toast.success('Contribution approved and added to budget');
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve contribution');
    }
  };

  const rejectContribution = async (id: string) => {
    try {
      await api.rejectContribution(id);
      setContributions(prev => 
        prev.map(c => c.id === id ? { ...c, status: 'REJECTED' } : c)
      );
      toast.error('Contribution rejected');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject contribution');
    }
  };

  const pendingCount = contributions.filter(c => c.status === 'PENDING').length;
  const approvedCount = contributions.filter(c => c.status === 'APPROVED').length;
  const rejectedCount = contributions.filter(c => c.status === 'REJECTED').length;
  const totalAmount = contributions
    .filter(c => c.status === 'APPROVED')
    .reduce((sum, c) => sum + c.amount, 0);

  return {
    contributions,
    isLoading,
    error,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalAmount,
    approveContribution,
    rejectContribution,
    refetch: fetchContributions,
  };
}
