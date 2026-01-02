import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface PublicStats {
  totalDonations: number;
  totalBeneficiaries: number;
  totalAssociations: number;
  successRate: number;
}

export function usePublicStats() {
  const [stats, setStats] = useState<PublicStats>({
    totalDonations: 0,
    totalBeneficiaries: 0,
    totalAssociations: 0,
    successRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all associations
        const associations = await api.getAssociations();
        
        // Calculate aggregate stats from all associations
        let totalDonations = 0;
        let totalBeneficiaries = 0;
        let totalCompletedDonations = 0;
        let totalDonationCount = 0;

        for (const assoc of associations) {
          // Sum up donations
          if (assoc._count?.donations) {
            totalDonationCount += assoc._count.donations;
          }
          
          // Sum up beneficiaries
          if (assoc._count?.beneficiaries) {
            totalBeneficiaries += assoc._count.beneficiaries;
          }

          // Try to get detailed donation data for this association
          try {
            const donations = await api.getDonations(assoc.id);
            donations.forEach((d: any) => {
              if (d.amount) {
                totalDonations += d.amount;
              }
              if (d.status === 'COMPLETED') {
                totalCompletedDonations++;
              }
            });
          } catch (err) {
            // Skip if can't fetch donations for this association
            console.warn(`Could not fetch donations for ${assoc.id}`);
          }
        }

        const successRate = totalDonationCount > 0 
          ? (totalCompletedDonations / totalDonationCount) * 100 
          : 0;

        setStats({
          totalDonations,
          totalBeneficiaries,
          totalAssociations: associations.length,
          successRate: Math.round(successRate * 10) / 10,
        });
      } catch (err: any) {
        console.error('Failed to fetch public stats:', err);
        setError(err.message);
        // Set fallback stats
        setStats({
          totalDonations: 0,
          totalBeneficiaries: 0,
          totalAssociations: 0,
          successRate: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}
