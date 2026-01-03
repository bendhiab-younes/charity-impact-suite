import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RulesService } from '../rules/rules.service';
import { FamiliesService } from '../families/families.service';

@Injectable()
export class MobileService {
  constructor(
    private prisma: PrismaService,
    private rulesService: RulesService,
    private familiesService: FamiliesService,
  ) {}

  // ==================== PUBLIC ENDPOINTS ====================

  /**
   * Get all active associations for public browsing
   */
  async getPublicAssociations() {
    return this.prisma.association.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        email: true,
        phone: true,
        website: true,
        _count: {
          select: {
            beneficiaries: true,
            donations: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get association details by ID
   */
  async getAssociationDetails(id: string) {
    const association = await this.prisma.association.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            beneficiaries: true,
            donations: true,
            families: true,
          },
        },
      },
    });

    if (!association || association.status !== 'ACTIVE') {
      throw new NotFoundException('Association not found');
    }

    // Get donation stats
    const donations = await this.prisma.donation.findMany({
      where: { associationId: id, status: 'COMPLETED' },
      select: { amount: true },
    });

    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const donationCount = donations.length;

    return {
      ...association,
      stats: {
        totalDonations,
        donationCount,
        beneficiaryCount: association._count.beneficiaries,
        familyCount: association._count.families,
      },
    };
  }

  // ==================== DONOR ENDPOINTS ====================

  /**
   * Create a donation from a mobile donor
   * Can be anonymous (no donorId) or authenticated
   */
  async createMobileDonation(data: {
    associationId: string;
    amount: number;
    donorId?: string;
    type?: string;
    method?: string;
    notes?: string;
  }) {
    // Validate association exists and is active
    const association = await this.prisma.association.findUnique({
      where: { id: data.associationId },
    });

    if (!association || association.status !== 'ACTIVE') {
      throw new BadRequestException('Association not found or not active');
    }

    if (data.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Check AMOUNT rules
    const rules = await this.rulesService.findByAssociation(data.associationId);
    const activeRules = rules.filter((r) => r.isActive);
    const amountRule = activeRules.find((r) => r.type === 'AMOUNT');
    
    if (amountRule && data.amount > amountRule.value) {
      throw new BadRequestException(
        `Donation amount exceeds maximum allowed (${amountRule.value} ${amountRule.unit || 'TND'}).`,
      );
    }

    const donation = await this.prisma.donation.create({
      data: {
        associationId: data.associationId,
        amount: data.amount,
        donorId: data.donorId,
        type: data.type || 'ONE_TIME',
        method: data.method || 'CARD',
        status: 'PENDING',
        currency: 'TND',
        notes: data.notes,
      },
    });

    return {
      id: donation.id,
      amount: donation.amount,
      status: donation.status,
      message: 'Donation submitted successfully. Awaiting approval.',
    };
  }

  /**
   * Get donation history for a donor
   */
  async getDonorHistory(donorId: string) {
    return this.prisma.donation.findMany({
      where: { donorId },
      include: {
        association: {
          select: { id: true, name: true, logo: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== ASSOCIATION MEMBER ENDPOINTS ====================

  /**
   * Get beneficiaries for dispatch (association members/admins)
   */
  async getBeneficiariesForDispatch(associationId: string) {
    return this.prisma.beneficiary.findMany({
      where: { 
        associationId,
        status: 'ELIGIBLE',
      },
      include: {
        family: {
          select: { 
            id: true, 
            name: true, 
            memberCount: true,
            status: true,
            lastDonationDate: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  /**
   * Get pending donations for an association (to dispatch)
   */
  async getPendingDonations(associationId: string) {
    return this.prisma.donation.findMany({
      where: { 
        associationId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
      include: {
        donor: { select: { id: true, name: true } },
        beneficiary: { select: { id: true, firstName: true, lastName: true } },
        family: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Dispatch a donation to a beneficiary
   * This assigns a beneficiary/family to an approved donation and marks it completed
   */
  async dispatchDonation(data: {
    donationId: string;
    beneficiaryId: string;
    associationId: string;
    dispatchedBy: string;
  }) {
    // Get the donation
    const donation = await this.prisma.donation.findUnique({
      where: { id: data.donationId },
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    if (donation.associationId !== data.associationId) {
      throw new BadRequestException('Donation does not belong to your association');
    }

    if (donation.status !== 'APPROVED' && donation.status !== 'PENDING') {
      throw new BadRequestException('Only pending or approved donations can be dispatched');
    }

    // Get the beneficiary and their family
    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { id: data.beneficiaryId },
      include: { family: true },
    });

    if (!beneficiary) {
      throw new NotFoundException('Beneficiary not found');
    }

    if (beneficiary.associationId !== data.associationId) {
      throw new BadRequestException('Beneficiary does not belong to your association');
    }

    if (beneficiary.status !== 'ELIGIBLE') {
      throw new BadRequestException('Beneficiary is not eligible for donations');
    }

    const familyId = beneficiary.familyId;

    // Check rules
    const rules = await this.rulesService.findByAssociation(data.associationId);
    const activeRules = rules.filter((r) => r.isActive);

    // Check FREQUENCY rule (cooldown)
    const cooldownRule = activeRules.find((r) => r.type === 'FREQUENCY');
    if (cooldownRule && familyId) {
      const isEligible = await this.familiesService.checkCooldown(
        familyId,
        cooldownRule.value,
      );
      if (!isEligible) {
        throw new BadRequestException(
          `Family is in cooldown period. Wait ${cooldownRule.value} ${cooldownRule.unit || 'days'} between donations.`,
        );
      }
    }

    // Check ELIGIBILITY rule (minimum family members)
    const eligibilityRule = activeRules.find((r) => r.type === 'ELIGIBILITY');
    if (eligibilityRule && eligibilityRule.unit === 'members' && beneficiary.family) {
      if (beneficiary.family.memberCount < eligibilityRule.value) {
        throw new BadRequestException(
          `Family does not meet minimum member requirement (${eligibilityRule.value} members).`,
        );
      }
    }

    // Update donation with beneficiary and mark as completed
    const updatedDonation = await this.prisma.donation.update({
      where: { id: data.donationId },
      data: {
        beneficiaryId: data.beneficiaryId,
        familyId: familyId,
        status: 'COMPLETED',
        processedAt: new Date(),
        notes: donation.notes 
          ? `${donation.notes}\nDispatched by user ${data.dispatchedBy}`
          : `Dispatched by user ${data.dispatchedBy}`,
      },
    });

    // Update beneficiary stats
    await this.prisma.beneficiary.update({
      where: { id: data.beneficiaryId },
      data: {
        lastDonationDate: new Date(),
        totalReceived: { increment: donation.amount },
      },
    });

    // Update family stats
    if (familyId) {
      await this.prisma.family.update({
        where: { id: familyId },
        data: {
          lastDonationDate: new Date(),
          totalReceived: { increment: donation.amount },
          status: 'COOLDOWN',
        },
      });
    }

    return {
      id: updatedDonation.id,
      status: 'COMPLETED',
      beneficiaryId: data.beneficiaryId,
      amount: updatedDonation.amount,
      message: 'Donation dispatched successfully',
    };
  }

  /**
   * Get association dashboard stats for mobile
   */
  async getAssociationDashboard(associationId: string) {
    const [
      totalDonations,
      pendingDonations,
      completedDonations,
      beneficiaryCount,
      eligibleBeneficiaries,
      familyCount,
    ] = await Promise.all([
      this.prisma.donation.aggregate({
        where: { associationId, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.donation.count({
        where: { associationId, status: 'PENDING' },
      }),
      this.prisma.donation.count({
        where: { associationId, status: 'COMPLETED' },
      }),
      this.prisma.beneficiary.count({
        where: { associationId },
      }),
      this.prisma.beneficiary.count({
        where: { associationId, status: 'ELIGIBLE' },
      }),
      this.prisma.family.count({
        where: { associationId },
      }),
    ]);

    return {
      donations: {
        totalAmount: totalDonations._sum.amount || 0,
        totalCount: totalDonations._count,
        pendingCount: pendingDonations,
        completedCount: completedDonations,
      },
      beneficiaries: {
        total: beneficiaryCount,
        eligible: eligibleBeneficiaries,
      },
      families: {
        total: familyCount,
      },
    };
  }
}
