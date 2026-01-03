import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface DistributionItem {
  label: string;
  pct: number;
  count: number;
}

interface GlobalStats {
  totalAssociations: number;
  activeAssociations: number;
  totalBeneficiaries: number;
  totalDonations: number;
  totalDonationAmount: number;
  successRate: number;
  growthRate: number;
  distributionByType: DistributionItem[];
  distributionByCategory: DistributionItem[];
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
    distributionByType: [],
    distributionByCategory: [],
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
        
        // Track donation types and association categories
        const typeCount: Record<string, number> = {};
        const categoryCount: Record<string, number> = {};

        for (const assoc of associations) {
          if (assoc._count?.beneficiaries) {
            totalBeneficiaries += assoc._count.beneficiaries;
          }

          // Track association category
          const category = assoc.category || 'Other';
          categoryCount[category] = (categoryCount[category] || 0) + 1;

          try {
            const donations = await api.getDonations(assoc.id);
            totalDonations += donations.length;
            donations.forEach((d: any) => {
              if (d.amount) totalDonationAmount += d.amount;
              if (d.status === 'COMPLETED') completedDonations++;
              // Track donation type
              const type = d.type || 'OTHER';
              typeCount[type] = (typeCount[type] || 0) + 1;
            });
          } catch (err) {
            console.warn(`Could not fetch donations for ${assoc.id}`);
          }
        }

        // Calculate distribution percentages
        const distributionByType = Object.entries(typeCount)
          .map(([label, count]) => ({
            label: label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            count,
            pct: totalDonations > 0 ? Math.round((count / totalDonations) * 100) : 0,
          }))
          .sort((a, b) => b.pct - a.pct);

        const totalAssocCount = associations.length;
        const distributionByCategory = Object.entries(categoryCount)
          .map(([label, count]) => ({
            label,
            count,
            pct: totalAssocCount > 0 ? Math.round((count / totalAssocCount) * 100) : 0,
          }))
          .sort((a, b) => b.pct - a.pct);

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
          distributionByType,
          distributionByCategory,
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
