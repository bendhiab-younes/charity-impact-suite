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

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

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

    // Get contribution stats
    const contributions = await this.prisma.contribution.findMany({
      where: { associationId: id, status: 'COMPLETED' },
      select: { amount: true },
    });

    // Get dispatch stats
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

  // ============================================================================
  // DONOR ENDPOINTS
  // ============================================================================

  /**
   * Create a contribution (donation from donor to association)
   */
  async createContribution(data: {
    associationId: string;
    amount: number;
    donorId?: string;
    donorName?: string;
    donorEmail?: string;
    type?: string;
    method?: string;
    notes?: string;
  }) {
    // Validate association
    const association = await this.prisma.association.findUnique({
      where: { id: data.associationId },
    });

    if (!association || association.status !== 'ACTIVE') {
      throw new BadRequestException('Association not found or not active');
    }

    if (data.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Check AMOUNT rule (max donation limit)
    const rules = await this.rulesService.findByAssociation(data.associationId);
    const amountRule = rules.find((r: any) => r.type === 'AMOUNT' && r.isActive);
    
    if (amountRule && data.amount > amountRule.value) {
      throw new BadRequestException(
        `Donation amount exceeds maximum allowed (${amountRule.value} ${amountRule.unit || 'TND'}).`,
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
      message: 'Donation submitted successfully. Awaiting approval.',
    };
  }

  /**
   * Get donor's contribution history
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

  // ============================================================================
  // STAFF - CONTRIBUTION APPROVAL
  // ============================================================================

  /**
   * Get pending contributions for an association
   */
  async getPendingContributions(associationId: string) {
    return this.prisma.contribution.findMany({
      where: { 
        associationId,
        status: 'PENDING',
      },
      include: {
        donor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Approve or reject a contribution
   */
  async approveOrRejectContribution(data: {
    contributionId: string;
    action: 'APPROVE' | 'REJECT';
    reason?: string;
    associationId: string;
    approvedById: string;
  }) {
    const contribution = await this.prisma.contribution.findUnique({
      where: { id: data.contributionId },
    });

    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    if (contribution.associationId !== data.associationId) {
      throw new BadRequestException('Contribution does not belong to your association');
    }

    if (contribution.status !== 'PENDING') {
      throw new BadRequestException('Only pending contributions can be approved/rejected');
    }

    if (data.action === 'APPROVE') {
      // Approve: Update status and add to budget
      const [updatedContribution] = await this.prisma.$transaction([
        this.prisma.contribution.update({
          where: { id: data.contributionId },
          data: {
            status: 'COMPLETED',
            approvedAt: new Date(),
            notes: contribution.notes 
              ? `${contribution.notes}\nApproved by user ${data.approvedById}`
              : `Approved by user ${data.approvedById}`,
          },
        }),
        this.prisma.association.update({
          where: { id: data.associationId },
          data: {
            budget: { increment: contribution.amount },
          },
        }),
      ]);

      return {
        id: updatedContribution.id,
        status: 'COMPLETED',
        amount: updatedContribution.amount,
        message: 'Contribution approved and added to budget',
      };
    } else {
      // Reject
      if (!data.reason) {
        throw new BadRequestException('Rejection reason is required');
      }

      const updatedContribution = await this.prisma.contribution.update({
        where: { id: data.contributionId },
        data: {
          status: 'REJECTED',
          notes: contribution.notes 
            ? `${contribution.notes}\nRejected: ${data.reason}`
            : `Rejected: ${data.reason}`,
        },
      });

      return {
        id: updatedContribution.id,
        status: 'REJECTED',
        message: 'Contribution rejected',
      };
    }
  }

  // ============================================================================
  // STAFF - BENEFICIARY LOOKUP
  // ============================================================================

  /**
   * Lookup beneficiary by National ID
   */
  async lookupBeneficiaryByNationalId(nationalId: string, associationId: string) {
    const beneficiary = await this.prisma.beneficiary.findFirst({
      where: { 
        nationalId,
        associationId,
      },
      include: {
        family: true,
      },
    });

    if (!beneficiary) {
      throw new NotFoundException(`Beneficiary with National ID "${nationalId}" not found in your association`);
    }

    // Check eligibility and cooldown
    let canReceive = beneficiary.status === 'ELIGIBLE';
    let cooldownEnds = null;

    if (canReceive && beneficiary.familyId) {
      const rules = await this.rulesService.findByAssociation(associationId);
      const cooldownRule = rules.find((r: any) => r.type === 'FREQUENCY' && r.isActive);
      
      if (cooldownRule) {
        canReceive = await this.familiesService.checkCooldown(
          beneficiary.familyId,
          cooldownRule.value,
        );
        if (!canReceive && beneficiary.family?.lastDonationDate) {
          const endDate = new Date(beneficiary.family.lastDonationDate);
          endDate.setDate(endDate.getDate() + cooldownRule.value);
          cooldownEnds = endDate;
        }
      }
    }

    return {
      id: beneficiary.id,
      nationalId: beneficiary.nationalId,
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      status: beneficiary.status,
      totalReceived: beneficiary.totalReceived,
      lastDonationDate: beneficiary.lastDonationDate,
      family: beneficiary.family ? {
        id: beneficiary.family.id,
        name: beneficiary.family.name,
        memberCount: beneficiary.family.memberCount,
        status: beneficiary.family.status,
      } : null,
      canReceive,
      cooldownEnds,
      message: canReceive ? 'Eligible for aid' : (cooldownEnds ? `In cooldown until ${cooldownEnds.toDateString()}` : 'Not eligible'),
    };
  }

  // ============================================================================
  // STAFF - DISPATCH AID
  // ============================================================================

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
   * Get eligible beneficiaries for dispatch
   */
  async getEligibleBeneficiariesForDispatch(associationId: string) {
    const beneficiaries = await this.prisma.beneficiary.findMany({
      where: {
        associationId,
        status: 'ELIGIBLE',
      },
      include: { family: true },
      orderBy: { lastName: 'asc' },
    });

    const rules = await this.rulesService.findByAssociation(associationId);
    const cooldownRule = rules.find((r: any) => r.type === 'FREQUENCY' && r.isActive);

    const results = await Promise.all(
      beneficiaries.map(async (b: any) => {
        let canReceive = true;
        let cooldownEnds = null;

        if (cooldownRule && b.familyId) {
          canReceive = await this.familiesService.checkCooldown(b.familyId, cooldownRule.value);
          if (!canReceive && b.family?.lastDonationDate) {
            const endDate = new Date(b.family.lastDonationDate);
            endDate.setDate(endDate.getDate() + cooldownRule.value);
            cooldownEnds = endDate;
          }
        }

        return {
          id: b.id,
          nationalId: b.nationalId,
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
   * Dispatch aid by National ID
   */
  async dispatchByNationalId(data: {
    nationalId: string;
    amount: number;
    aidType?: string;
    notes?: string;
    associationId: string;
    processedById: string;
  }) {
    // Find beneficiary by national ID
    const beneficiary = await this.prisma.beneficiary.findFirst({
      where: { 
        nationalId: data.nationalId,
        associationId: data.associationId,
      },
    });

    if (!beneficiary) {
      throw new NotFoundException(`Beneficiary with National ID "${data.nationalId}" not found`);
    }

    // Delegate to dispatchById
    return this.dispatchById({
      beneficiaryId: beneficiary.id,
      amount: data.amount,
      aidType: data.aidType,
      notes: data.notes,
      associationId: data.associationId,
      processedById: data.processedById,
    });
  }

  /**
   * Dispatch aid by Beneficiary ID
   */
  async dispatchById(data: {
    beneficiaryId: string;
    amount: number;
    aidType?: string;
    notes?: string;
    associationId: string;
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

    // Get beneficiary and family
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

    const familyId = beneficiary.familyId;

    // Check rules
    const rules = await this.rulesService.findByAssociation(data.associationId);
    const activeRules = rules.filter((r: any) => r.isActive);

    // FREQUENCY rule (cooldown)
    const cooldownRule = activeRules.find((r: any) => r.type === 'FREQUENCY');
    if (cooldownRule && familyId) {
      const isEligible = await this.familiesService.checkCooldown(familyId, cooldownRule.value);
      if (!isEligible) {
        throw new BadRequestException(
          `Family is in cooldown. Must wait ${cooldownRule.value} ${cooldownRule.unit || 'days'} between dispatches.`,
        );
      }
    }

    // AMOUNT rule
    const amountRule = activeRules.find((r: any) => r.type === 'AMOUNT');
    if (amountRule && data.amount > amountRule.value) {
      throw new BadRequestException(
        `Amount exceeds maximum allowed (${amountRule.value} ${amountRule.unit || 'TND'}).`,
      );
    }

    // ELIGIBILITY rule (min family members)
    const eligibilityRule = activeRules.find((r: any) => r.type === 'ELIGIBILITY');
    if (eligibilityRule && eligibilityRule.unit === 'members' && beneficiary.family) {
      if (beneficiary.family.memberCount < eligibilityRule.value) {
        throw new BadRequestException(
          `Family does not meet minimum member requirement (${eligibilityRule.value} members).`,
        );
      }
    }

    // Execute dispatch in transaction
    const [dispatch] = await this.prisma.$transaction([
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
      this.prisma.association.update({
        where: { id: data.associationId },
        data: { budget: { decrement: data.amount } },
      }),
      this.prisma.beneficiary.update({
        where: { id: data.beneficiaryId },
        data: {
          lastDonationDate: new Date(),
          totalReceived: { increment: data.amount },
        },
      }),
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
      beneficiaryId: dispatch.beneficiaryId,
      beneficiaryName: `${dispatch.beneficiary?.firstName} ${dispatch.beneficiary?.lastName}`,
      beneficiaryNationalId: dispatch.beneficiary?.nationalId,
      familyId: dispatch.familyId,
      familyName: dispatch.family?.name,
      status: 'COMPLETED',
      message: 'Aid dispatched successfully',
    };
  }

  /**
   * Get dispatch history
   */
  async getDispatchHistory(associationId: string) {
    return this.prisma.dispatch.findMany({
      where: { associationId },
      include: {
        beneficiary: {
          select: { id: true, nationalId: true, firstName: true, lastName: true },
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

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  /**
   * Get dashboard statistics
   */
  async getDashboard(associationId: string) {
    const [
      association,
      pendingContributions,
      completedContributions,
      completedDispatches,
      beneficiaryCount,
      eligibleBeneficiaries,
      familyCount,
    ] = await Promise.all([
      this.prisma.association.findUnique({
        where: { id: associationId },
        select: { budget: true },
      }),
      this.prisma.contribution.aggregate({
        where: { associationId, status: 'PENDING' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.contribution.aggregate({
        where: { associationId, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.dispatch.aggregate({
        where: { associationId, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
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
      budget: association?.budget || 0,
      contributions: {
        pendingAmount: pendingContributions._sum.amount || 0,
        pendingCount: pendingContributions._count,
        completedAmount: completedContributions._sum.amount || 0,
        completedCount: completedContributions._count,
      },
      dispatches: {
        totalAmount: completedDispatches._sum.amount || 0,
        totalCount: completedDispatches._count,
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

  // ============================================================================
  // LEGACY METHODS (for backward compatibility)
  // ============================================================================

  async createMobileContribution(data: any) {
    return this.createContribution(data);
  }

  async createMobileDonation(data: any) {
    return this.createContribution(data);
  }

  async getDonorHistory(donorId: string) {
    return this.getDonorContributions(donorId);
  }

  async getBeneficiariesForDispatch(associationId: string) {
    return this.getEligibleBeneficiariesForDispatch(associationId);
  }

  async getPendingDonations(associationId: string) {
    return this.getPendingContributions(associationId);
  }

  async getAssociationDashboard(associationId: string) {
    return this.getDashboard(associationId);
  }

  async createDispatch(data: any) {
    return this.dispatchById({
      beneficiaryId: data.beneficiaryId,
      amount: data.amount,
      aidType: data.aidType,
      notes: data.notes,
      associationId: data.associationId,
      processedById: data.processedById,
    });
  }

  async dispatchDonation(data: any) {
    // Legacy: dispatch a donation to a beneficiary
    // This was for the old model where donations were dispatched
    throw new BadRequestException('Legacy donation dispatch is deprecated. Use dispatch/by-id or dispatch/by-national-id.');
  }
}
