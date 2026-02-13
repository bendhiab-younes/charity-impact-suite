import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Donation = Aid OUT to beneficiaries
 * This was previously called "Dispatch" - keeping the hook name for backward compatibility
 */
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
    nationalId?: string;
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
  association?: {
    id: string;
    name: string;
  };
}

export interface EligibleBeneficiary {
  id: string;
  nationalId?: string;
  firstName: string;
  lastName: string;
  status: string;
  totalReceived: number;
  lastAidDate?: string;
  lastDonationDate?: string;
  canReceive?: boolean;
  cooldownEnds?: string;
  family?: {
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
      const [donationData, statsData, eligibleData] = await Promise.all([
        api.getDonations(user.associationId),
        api.getDonationStats().catch(() => ({ budget: 0, totalAmount: 0, totalCount: 0 })),
        api.getEligibleBeneficiaries().catch(() => []),
      ]);
      setDispatches(Array.isArray(donationData) ? donationData : []);
      setBudget(statsData?.budget || 0);
      setEligibleBeneficiaries(Array.isArray(eligibleData) ? eligibleData : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load donations data');
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
      const donation = await api.createDonation({
        ...data,
        associationId: user.associationId,
      });
      setDispatches(prev => [donation, ...prev]);
      setBudget(prev => prev - data.amount);
      toast.success('Aid dispatched successfully');
      return donation;
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch aid');
      throw err;
    }
  };

  const cancelDispatch = async (id: string) => {
    try {
      const result = await api.cancelDonation(id);
      setDispatches(prev => 
        prev.map(d => d.id === id ? { ...d, status: 'CANCELLED' } : d)
      );
      // Refetch to get updated budget
      fetchDispatches();
      toast.success('Donation cancelled and budget restored');
      return result;
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel donation');
      throw err;
    }
  };

  const pendingCount = dispatches.filter(d => d.status === 'PENDING').length;
  const completedCount = dispatches.filter(d => d.status === 'COMPLETED').length;
  const totalDispatched = dispatches
    .filter(d => d.status === 'COMPLETED')
    .reduce((sum, d) => sum + d.amount, 0);

  return {
    dispatches,
    // Alias for new naming
    donations: dispatches,
    eligibleBeneficiaries,
    budget,
    isLoading,
    error,
    pendingCount,
    completedCount,
    totalDispatched,
    createDispatch,
    // Alias for new naming
    createDonation: createDispatch,
    cancelDispatch,
    cancelDonation: cancelDispatch,
    refetch: fetchDispatches,
  };
}
