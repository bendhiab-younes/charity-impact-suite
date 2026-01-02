import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface GlobalStats {
  totalAssociations: number;
  activeAssociations: number;
  totalBeneficiaries: number;
  totalDonations: number;
  totalDonationAmount: number;
  successRate: number;
  growthRate: number;
}

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats>({
    totalAssociations: 0,
    activeAssociations: 0,
    totalBeneficiaries: 0,
    totalDonations: 0,
    totalDonationAmount: 0,
    successRate: 0,
    growthRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const associations = await api.getAssociations();
        
        let totalBeneficiaries = 0;
        let totalDonationAmount = 0;
        let totalDonations = 0;
        let completedDonations = 0;
        const activeAssociations = associations.filter((a: any) => a.status === 'ACTIVE').length;

        for (const assoc of associations) {
          if (assoc._count?.beneficiaries) {
            totalBeneficiaries += assoc._count.beneficiaries;
          }

          try {
            const donations = await api.getDonations(assoc.id);
            totalDonations += donations.length;
            donations.forEach((d: any) => {
              if (d.amount) totalDonationAmount += d.amount;
              if (d.status === 'COMPLETED') completedDonations++;
            });
          } catch (err) {
            console.warn(`Could not fetch donations for ${assoc.id}`);
          }
        }

        const successRate = totalDonations > 0 
          ? Math.round((completedDonations / totalDonations) * 100)
          : 0;

        setStats({
          totalAssociations: associations.length,
          activeAssociations,
          totalBeneficiaries,
          totalDonations,
          totalDonationAmount,
          successRate,
          growthRate: 18, // Could be calculated from historical data
        });
      } catch (err) {
        console.error('Failed to fetch global stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading };
}
