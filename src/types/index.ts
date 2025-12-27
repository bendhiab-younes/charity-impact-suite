export type UserRole = 'super_admin' | 'association_admin' | 'association_member' | 'donor' | 'public';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  associationId?: string;
  avatar?: string;
  createdAt: string;
}

export interface Association {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'active' | 'pending' | 'suspended';
  totalDonations: number;
  totalBeneficiaries: number;
  totalMembers: number;
  createdAt: string;
  impactMetrics: ImpactMetrics;
}

export interface ImpactMetrics {
  familiesHelped: number;
  donationsThisMonth: number;
  averageDonation: number;
  successRate: number;
}

export interface Beneficiary {
  id: string;
  associationId: string;
  familyId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'eligible' | 'ineligible' | 'pending_review';
  lastDonationDate?: string;
  totalReceived: number;
  createdAt: string;
  eligibilityNotes?: string;
}

export interface Family {
  id: string;
  associationId: string;
  name: string;
  memberCount: number;
  address?: string;
  totalReceived: number;
  lastDonationDate?: string;
  status: 'eligible' | 'ineligible' | 'cooldown';
  beneficiaries: Beneficiary[];
}

export interface Donation {
  id: string;
  associationId: string;
  donorId?: string;
  beneficiaryId?: string;
  familyId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  type: 'one_time' | 'recurring';
  method: 'card' | 'bank_transfer' | 'cash' | 'check';
  createdAt: string;
  processedAt?: string;
  notes?: string;
}

export interface DonationRule {
  id: string;
  associationId: string;
  name: string;
  description: string;
  type: 'frequency' | 'amount' | 'eligibility';
  value: number;
  unit?: 'days' | 'weeks' | 'months' | 'currency';
  isActive: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  associationId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  entityType: 'donation' | 'beneficiary' | 'family' | 'rule' | 'member';
  entityId: string;
}
