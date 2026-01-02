import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalDonations: number;
  donationsThisMonth: number;
  totalBeneficiaries: number;
  familiesHelped: number;
  successRate: number;
}

interface DashboardData {
  association: any | null;
  donations: any[];
  pendingDonations: any[];
  beneficiaries: any[];
  pendingBeneficiaries: any[];
  families: any[];
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const { user } = useAuth();
  const [association, setAssociation] = useState<any | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // For users without an association (donors, super admins), show empty state
      if (!user?.associationId) {
        setIsLoading(false);
        setError('No association linked to your account');
        return;
      }

      try {
        const [assocData, donationsData, beneficiariesData, familiesData] = await Promise.all([
          api.getAssociation(user.associationId),
          api.getDonations(user.associationId),
          api.getBeneficiaries(user.associationId),
          api.getFamilies(user.associationId),
        ]);

        setAssociation(assocData);
        setDonations(Array.isArray(donationsData) ? donationsData : []);
        setBeneficiaries(Array.isArray(beneficiariesData) ? beneficiariesData : []);
        setFamilies(Array.isArray(familiesData) ? familiesData : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.associationId]);

  const pendingDonations = donations.filter(d => d.status === 'PENDING');
  const pendingBeneficiaries = beneficiaries.filter(b => b.status === 'PENDING_REVIEW');
  const completedDonations = donations.filter(d => d.status === 'COMPLETED');

  const totalDonations = completedDonations.reduce((sum, d) => sum + d.amount, 0);
  
  const now = new Date();
  const thisMonth = donations.filter(d => {
    const date = new Date(d.createdAt);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const donationsThisMonth = thisMonth.reduce((sum, d) => sum + d.amount, 0);

  const successRate = donations.length > 0 
    ? Math.round((completedDonations.length / donations.length) * 100) 
    : 100;

  return {
    association,
    donations,
    pendingDonations,
    beneficiaries,
    pendingBeneficiaries,
    families,
    stats: {
      totalDonations,
      donationsThisMonth,
      totalBeneficiaries: beneficiaries.length,
      familiesHelped: families.length,
      successRate,
    },
    isLoading,
    error,
  };
}
