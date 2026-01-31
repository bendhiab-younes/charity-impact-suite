import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface DonorStats {
  totalDonated: number;
  donationsCount: number;
  associationsSupported: number;
  donationsThisMonth: number;
}

interface DonorDashboardData {
  associations: any[];
  myDonations: any[];
  stats: DonorStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDonorDashboardData(): DonorDashboardData {
  const { user } = useAuth();
  const [associations, setAssociations] = useState<any[]>([]);
  const [myDonations, setMyDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [associationsData, donationsData] = await Promise.all([
        api.getAssociations(),
        api.getMyDonations(),
      ]);

      setAssociations(Array.isArray(associationsData) ? associationsData : []);
      setMyDonations(Array.isArray(donationsData) ? donationsData : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate donor stats
  const completedDonations = myDonations.filter(d => d.status === 'COMPLETED' || d.status === 'APPROVED');
  const totalDonated = completedDonations.reduce((sum, d) => sum + d.amount, 0);
  
  const uniqueAssociations = new Set(myDonations.map(d => d.associationId));
  
  const now = new Date();
  const thisMonthDonations = myDonations.filter(d => {
    const date = new Date(d.createdAt);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const donationsThisMonth = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0);

  return {
    associations,
    myDonations,
    stats: {
      totalDonated,
      donationsCount: myDonations.length,
      associationsSupported: uniqueAssociations.size,
      donationsThisMonth,
    },
    isLoading,
    error,
    refetch: fetchData,
  };
}
