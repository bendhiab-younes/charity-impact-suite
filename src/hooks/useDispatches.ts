import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Dispatch {
  id: string;
  amount: number;
  currency: string;
  status: string;
  aidType: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  beneficiary: {
    id: string;
    firstName: string;
    lastName: string;
  };
  family?: {
    id: string;
    name: string;
  };
  processedBy?: {
    id: string;
    name: string;
  };
  association: {
    id: string;
    name: string;
  };
}

export interface EligibleBeneficiary {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  totalReceived: number;
  lastDonationDate?: string;
  family: {
    id: string;
    name: string;
    memberCount: number;
    status: string;
  };
}

export function useDispatches() {
  const { user } = useAuth();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [eligibleBeneficiaries, setEligibleBeneficiaries] = useState<EligibleBeneficiary[]>([]);
  const [budget, setBudget] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDispatches = useCallback(async () => {
    if (!user?.associationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [dispatchData, statsData, eligibleData] = await Promise.all([
        api.getDispatches(user.associationId),
        api.getDispatchStats(user.associationId),
        api.getEligibleBeneficiaries(user.associationId),
      ]);
      setDispatches(Array.isArray(dispatchData) ? dispatchData : []);
      setBudget(statsData?.budget || 0);
      setEligibleBeneficiaries(Array.isArray(eligibleData) ? eligibleData : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load dispatch data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.associationId]);

  useEffect(() => {
    fetchDispatches();
  }, [fetchDispatches]);

  const createDispatch = async (data: {
    beneficiaryId: string;
    familyId?: string;
    amount: number;
    aidType: string;
    notes?: string;
  }) => {
    if (!user?.associationId) {
      toast.error('No association selected');
      return;
    }

    try {
      const dispatch = await api.createDispatch({
        ...data,
        associationId: user.associationId,
      });
      setDispatches(prev => [dispatch, ...prev]);
      setBudget(prev => prev - data.amount);
      toast.success('Aid dispatched successfully');
      return dispatch;
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch aid');
      throw err;
    }
  };

  const pendingCount = dispatches.filter(d => d.status === 'PENDING').length;
  const completedCount = dispatches.filter(d => d.status === 'COMPLETED').length;
  const totalDispatched = dispatches
    .filter(d => d.status === 'COMPLETED' || d.status === 'APPROVED')
    .reduce((sum, d) => sum + d.amount, 0);

  return {
    dispatches,
    eligibleBeneficiaries,
    budget,
    isLoading,
    error,
    pendingCount,
    completedCount,
    totalDispatched,
    createDispatch,
    refetch: fetchDispatches,
  };
}
