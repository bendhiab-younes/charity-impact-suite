import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MobileService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

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
            donations: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getAssociationDetails(id: string) {
    const association = await this.prisma.association.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            beneficiaries: true,
            contributions: true,
            donations: true,
            families: true,
          },
        },
      },
    });

    if (!association || association.status !== 'ACTIVE') {
      throw new NotFoundException('Association not found');
    }

    const contributions = await this.prisma.contribution.findMany({
      where: { associationId: id, status: 'APPROVED' },
      select: { amount: true },
    });

    const donations = await this.prisma.donation.findMany({
      where: { associationId: id, status: 'COMPLETED' },
      select: { amount: true },
    });

    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

    return {
      ...association,
      stats: {
        budget: association.budget,
        totalContributions,
        contributionCount: contributions.length,
        totalDonated,
        donationCount: donations.length,
        beneficiaryCount: association._count.beneficiaries,
        familyCount: association._count.families,
      },
    };
  }

  // ============================================================================
  // DONOR ENDPOINTS
  // ============================================================================

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
    const association = await this.prisma.association.findUnique({
      where: { id: data.associationId },
    });

    if (!association || association.status !== 'ACTIVE') {
      throw new BadRequestException('Association not found or not active');
    }

    if (data.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
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
      const [updatedContribution] = await this.prisma.$transaction([
        this.prisma.contribution.update({
          where: { id: data.contributionId },
          data: {
            status: 'APPROVED',
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
        status: 'APPROVED',
        amount: updatedContribution.amount,
        message: 'Contribution approved and added to budget',
      };
    } else {
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

    let canReceive = beneficiary.status === 'ELIGIBLE';
    let cooldownEnds = null;

    if (canReceive && beneficiary.familyId) {
      const cooldownRule = await this.prisma.donationRule.findFirst({
        where: { associationId, type: 'FREQUENCY', isActive: true },
      });
      
      if (cooldownRule && beneficiary.family?.lastDonationDate) {
        const endDate = new Date(beneficiary.family.lastDonationDate);
        endDate.setDate(endDate.getDate() + cooldownRule.value);
        if (new Date() < endDate) {
          canReceive = false;
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
  // STAFF - GIVE DONATION (Aid OUT)
  // ============================================================================

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

  async getEligibleBeneficiariesForDispatch(associationId: string) {
    const beneficiaries = await this.prisma.beneficiary.findMany({
      where: {
        associationId,
        status: 'ELIGIBLE',
      },
      include: { family: true },
      orderBy: { lastName: 'asc' },
    });

    const cooldownRule = await this.prisma.donationRule.findFirst({
      where: { associationId, type: 'FREQUENCY', isActive: true },
    });

    const results = beneficiaries.map((b) => {
      let canReceive = true;
      let cooldownEnds = null;

      if (cooldownRule && b.familyId && b.family?.lastDonationDate) {
        const endDate = new Date(b.family.lastDonationDate);
        endDate.setDate(endDate.getDate() + cooldownRule.value);
        if (new Date() < endDate) {
          canReceive = false;
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
    });

    return results;
  }

  async dispatchByNationalId(data: {
    nationalId: string;
    amount: number;
    aidType?: string;
    notes?: string;
    associationId: string;
    processedById: string;
  }) {
    const beneficiary = await this.prisma.beneficiary.findFirst({
      where: { 
        nationalId: data.nationalId,
        associationId: data.associationId,
      },
    });

    if (!beneficiary) {
      throw new NotFoundException(`Beneficiary with National ID "${data.nationalId}" not found`);
    }

    return this.dispatchById({
      beneficiaryId: beneficiary.id,
      amount: data.amount,
      aidType: data.aidType,
      notes: data.notes,
      associationId: data.associationId,
      processedById: data.processedById,
    });
  }

  async dispatchById(data: {
    beneficiaryId: string;
    amount: number;
    aidType?: string;
    notes?: string;
    associationId: string;
    processedById: string;
  }) {
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
    const rules = await this.prisma.donationRule.findMany({
      where: { associationId: data.associationId, isActive: true },
    });

    // FREQUENCY rule (cooldown)
    const cooldownRule = rules.find((r) => r.type === 'FREQUENCY');
    if (cooldownRule && familyId && beneficiary.family?.lastDonationDate) {
      const endDate = new Date(beneficiary.family.lastDonationDate);
      endDate.setDate(endDate.getDate() + cooldownRule.value);
      if (new Date() < endDate) {
        throw new BadRequestException(
          `Family is in cooldown. Must wait ${cooldownRule.value} ${cooldownRule.unit || 'days'} between donations.`,
        );
      }
    }

    // AMOUNT rule (max per family member)
    const amountRule = rules.find((r) => r.type === 'AMOUNT');
    if (amountRule && beneficiary.family) {
      const maxAmount = amountRule.value * beneficiary.family.memberCount;
      if (data.amount > maxAmount) {
        throw new BadRequestException(
          `Amount exceeds maximum allowed (${amountRule.value} per member x ${beneficiary.family.memberCount} members = ${maxAmount} TND).`,
        );
      }
    }

    // ELIGIBILITY rule (min family members)
    const eligibilityRule = rules.find((r) => r.type === 'ELIGIBILITY');
    if (eligibilityRule && beneficiary.family) {
      if (beneficiary.family.memberCount < eligibilityRule.value) {
        throw new BadRequestException(
          `Family does not meet minimum member requirement (${eligibilityRule.value} members).`,
        );
      }
    }

    // Execute donation in transaction
    const [donation] = await this.prisma.$transaction([
      this.prisma.donation.create({
        data: {
          amount: data.amount,
          currency: 'TND',
          aidType: data.aidType || 'CASH',
          notes: data.notes,
          status: 'COMPLETED',
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
      id: donation.id,
      amount: donation.amount,
      aidType: donation.aidType,
      beneficiaryId: donation.beneficiaryId,
      beneficiaryName: `${donation.beneficiary?.firstName} ${donation.beneficiary?.lastName}`,
      beneficiaryNationalId: donation.beneficiary?.nationalId,
      familyId: donation.familyId,
      familyName: donation.family?.name,
      status: 'COMPLETED',
      message: 'Aid given successfully',
    };
  }

  async getDispatchHistory(associationId: string) {
    return this.prisma.donation.findMany({
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

  async getDashboard(associationId: string) {
    const [
      association,
      pendingContributions,
      completedContributions,
      completedDonations,
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
        where: { associationId, status: 'APPROVED' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.donation.aggregate({
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
      donations: {
        totalAmount: completedDonations._sum.amount || 0,
        totalCount: completedDonations._count,
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
