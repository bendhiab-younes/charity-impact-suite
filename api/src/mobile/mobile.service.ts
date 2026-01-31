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
        category: true,
        _count: {
          select: {
            beneficiaries: true,
            contributions: true,
            dispatches: true,
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
            contributions: true,
            dispatches: true,
            families: true,
          },
        },
      },
    });

    if (!association || association.status !== 'ACTIVE') {
      throw new NotFoundException('Association not found');
    }

    // Get contribution stats (money received)
    const contributions = await this.prisma.contribution.findMany({
      where: { associationId: id, status: 'COMPLETED' },
      select: { amount: true },
    });

    // Get dispatch stats (aid distributed)
    const dispatches = await this.prisma.dispatch.findMany({
      where: { associationId: id, status: 'COMPLETED' },
      select: { amount: true },
    });

    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalDispatched = dispatches.reduce((sum, d) => sum + d.amount, 0);

    return {
      ...association,
      stats: {
        budget: association.budget,
        totalContributions,
        contributionCount: contributions.length,
        totalDispatched,
        dispatchCount: dispatches.length,
        beneficiaryCount: association._count.beneficiaries,
        familyCount: association._count.families,
      },
    };
  }

  // ==================== DONOR ENDPOINTS ====================

  /**
   * Create a contribution from a mobile donor (NEW - uses Contribution model)
   * Can be anonymous (no donorId) or authenticated
   */
  async createMobileContribution(data: {
    associationId: string;
    amount: number;
    donorId?: string;
    donorName?: string;
    donorEmail?: string;
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
        `Contribution amount exceeds maximum allowed (${amountRule.value} ${amountRule.unit || 'TND'}).`,
      );
    }

    const contribution = await this.prisma.contribution.create({
      data: {
        associationId: data.associationId,
        amount: data.amount,
        donorId: data.donorId,
        donorName: data.donorName,
        donorEmail: data.donorEmail,
        type: data.type || 'ONE_TIME',
        method: data.method || 'CARD',
        status: 'PENDING',
        currency: 'TND',
        notes: data.notes,
      },
    });

    return {
      id: contribution.id,
      amount: contribution.amount,
      status: contribution.status,
      message: 'Contribution submitted successfully. Awaiting approval.',
    };
  }

  /**
   * Legacy: Create a donation (for backward compatibility)
   */
  async createMobileDonation(data: {
    associationId: string;
    amount: number;
    donorId?: string;
    type?: string;
    method?: string;
    notes?: string;
  }) {
    // Redirect to new contribution system
    return this.createMobileContribution(data);
  }

  /**
   * Get contribution history for a donor
   */
  async getDonorContributions(donorId: string) {
    return this.prisma.contribution.findMany({
      where: { donorId },
      include: {
        association: {
          select: { id: true, name: true, logo: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Legacy: Get donation history for backward compatibility
   */
  async getDonorHistory(donorId: string) {
    // Combine both legacy donations and new contributions
    const [donations, contributions] = await Promise.all([
      this.prisma.donation.findMany({
        where: { donorId },
        include: {
          association: {
            select: { id: true, name: true, logo: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contribution.findMany({
        where: { donorId },
        include: {
          association: {
            select: { id: true, name: true, logo: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Merge and sort by date
    const all = [
      ...donations.map(d => ({ ...d, source: 'donation' })),
      ...contributions.map(c => ({ ...c, source: 'contribution' })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return all;
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

  // ==================== NEW CONTRIBUTION/DISPATCH METHODS ====================

  /**
   * Get association budget
   */
  async getAssociationBudget(associationId: string) {
    const association = await this.prisma.association.findUnique({
      where: { id: associationId },
      select: { id: true, name: true, budget: true },
    });

    if (!association) {
      throw new NotFoundException('Association not found');
    }

    return {
      associationId: association.id,
      associationName: association.name,
      budget: association.budget || 0,
      currency: 'TND',
    };
  }

  /**
   * Get eligible beneficiaries for dispatch (with cooldown info)
   */
  async getEligibleBeneficiariesForDispatch(associationId: string) {
    const beneficiaries = await this.prisma.beneficiary.findMany({
      where: {
        associationId,
        status: 'ELIGIBLE',
      },
      include: {
        family: true,
      },
      orderBy: { lastName: 'asc' },
    });

    // Check cooldown status for each
    const rules = await this.rulesService.findByAssociation(associationId);
    const cooldownRule = rules.find((r: any) => r.type === 'FREQUENCY' && r.isActive);

    const results = await Promise.all(
      beneficiaries.map(async (b: any) => {
        let canReceive = true;
        let cooldownEnds = null;

        if (cooldownRule && b.familyId) {
          canReceive = await this.familiesService.checkCooldown(
            b.familyId,
            cooldownRule.value,
          );
          if (!canReceive && b.family?.lastDonationDate) {
            const endDate = new Date(b.family.lastDonationDate);
            endDate.setDate(endDate.getDate() + cooldownRule.value);
            cooldownEnds = endDate;
          }
        }

        return {
          id: b.id,
          firstName: b.firstName,
          lastName: b.lastName,
          familyId: b.familyId,
          familyName: b.family?.name,
          familyMemberCount: b.family?.memberCount,
          totalReceived: b.totalReceived,
          lastDonationDate: b.lastDonationDate,
          canReceive,
          cooldownEnds,
        };
      }),
    );

    return results;
  }

  /**
   * Create a dispatch (give aid to beneficiary from budget)
   */
  async createDispatch(data: {
    associationId: string;
    beneficiaryId: string;
    amount: number;
    aidType?: string;
    familyId?: string;
    notes?: string;
    processedById: string;
  }) {
    // Get association and check budget
    const association = await this.prisma.association.findUnique({
      where: { id: data.associationId },
    });

    if (!association) {
      throw new NotFoundException('Association not found');
    }

    if ((association.budget || 0) < data.amount) {
      throw new BadRequestException(
        `Insufficient budget. Available: ${association.budget || 0} TND, Requested: ${data.amount} TND`,
      );
    }

    // Get beneficiary and their family
    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { id: data.beneficiaryId },
      include: { family: true },
    });

    if (!beneficiary) {
      throw new NotFoundException('Beneficiary not found');
    }

    if (beneficiary.associationId !== data.associationId) {
      throw new BadRequestException('Beneficiary does not belong to this association');
    }

    if (beneficiary.status !== 'ELIGIBLE') {
      throw new BadRequestException('Beneficiary is not eligible for aid');
    }

    const familyId = data.familyId || beneficiary.familyId;

    // Check association rules
    const rules = await this.rulesService.findByAssociation(data.associationId);
    const activeRules = rules.filter((r: any) => r.isActive);

    // Check FREQUENCY rule (cooldown)
    const cooldownRule = activeRules.find((r: any) => r.type === 'FREQUENCY');
    if (cooldownRule && familyId) {
      const isEligible = await this.familiesService.checkCooldown(
        familyId,
        cooldownRule.value,
      );
      if (!isEligible) {
        throw new BadRequestException(
          `Family is in cooldown period. Must wait ${cooldownRule.value} ${cooldownRule.unit || 'days'} between aid dispatches.`,
        );
      }
    }

    // Check AMOUNT rule (max dispatch amount)
    const amountRule = activeRules.find((r: any) => r.type === 'AMOUNT');
    if (amountRule && data.amount > amountRule.value) {
      throw new BadRequestException(
        `Dispatch amount exceeds maximum allowed (${amountRule.value} ${amountRule.unit || 'TND'}).`,
      );
    }

    // Check ELIGIBILITY rule (minimum family members)
    const eligibilityRule = activeRules.find((r: any) => r.type === 'ELIGIBILITY');
    if (eligibilityRule && eligibilityRule.unit === 'members' && beneficiary.family) {
      if (beneficiary.family.memberCount < eligibilityRule.value) {
        throw new BadRequestException(
          `Family does not meet minimum member requirement (${eligibilityRule.value} members).`,
        );
      }
    }

    // Create dispatch, update budget, and update beneficiary/family stats in a transaction
    const [dispatch] = await this.prisma.$transaction([
      // Create the dispatch record
      this.prisma.dispatch.create({
        data: {
          amount: data.amount,
          currency: 'TND',
          aidType: data.aidType || 'CASH',
          notes: data.notes,
          status: 'COMPLETED',
          completedAt: new Date(),
          associationId: data.associationId,
          beneficiaryId: data.beneficiaryId,
          familyId: familyId,
          processedById: data.processedById,
        },
        include: {
          beneficiary: true,
          family: true,
        },
      }),
      // Deduct from association budget
      this.prisma.association.update({
        where: { id: data.associationId },
        data: {
          budget: { decrement: data.amount },
        },
      }),
      // Update beneficiary stats
      this.prisma.beneficiary.update({
        where: { id: data.beneficiaryId },
        data: {
          lastDonationDate: new Date(),
          totalReceived: { increment: data.amount },
        },
      }),
      // Update family stats
      ...(familyId ? [
        this.prisma.family.update({
          where: { id: familyId },
          data: {
            lastDonationDate: new Date(),
            totalReceived: { increment: data.amount },
            status: 'COOLDOWN',
          },
        }),
      ] : []),
    ]);

    return {
      id: dispatch.id,
      amount: dispatch.amount,
      aidType: dispatch.aidType,
      beneficiaryId: data.beneficiaryId,
      beneficiaryName: `${dispatch.beneficiary?.firstName} ${dispatch.beneficiary?.lastName}`,
      familyId: dispatch.familyId,
      status: 'COMPLETED',
      message: 'Aid dispatched successfully',
    };
  }

  /**
   * Get dispatch history for an association
   */
  async getDispatchHistory(associationId: string) {
    return this.prisma.dispatch.findMany({
      where: { associationId },
      include: {
        beneficiary: {
          select: { id: true, firstName: true, lastName: true },
        },
        family: {
          select: { id: true, name: true },
        },
        processedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
