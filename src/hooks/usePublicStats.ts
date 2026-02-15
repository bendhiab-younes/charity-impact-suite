import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface PublicStats {
  totalDonations: number;
  totalBeneficiaries: number;
  totalAssociations: number;
  totalRaised: number;
  totalDistributed: number;
  successRate: number;
}

export function usePublicStats() {
  const [stats, setStats] = useState<PublicStats>({
    totalDonations: 0,
    totalBeneficiaries: 0,
    totalAssociations: 0,
    totalRaised: 0,
    totalDistributed: 0,
    successRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await api.getPublicStats();
        setStats({
          totalDonations: data.totalDonations || 0,
          totalBeneficiaries: data.totalBeneficiaries || 0,
          totalAssociations: data.totalAssociations || 0,
          totalRaised: data.totalRaised || 0,
          totalDistributed: data.totalDistributed || 0,
          successRate: data.successRate || 0,
        });
      } catch (err: any) {
        console.error('Failed to fetch public stats:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}
