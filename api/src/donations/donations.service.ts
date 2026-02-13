import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';

/**
 * DonationsService - Handles AID DISTRIBUTION (money OUT to beneficiaries)
 * 
 * Flow:
 * 1. Staff member creates a donation to a beneficiary
 * 2. Rules are checked (frequency, amount per member, eligibility)
 * 3. Amount is deducted from association budget
 * 4. Beneficiary/Family stats are updated
 */
@Injectable()
export class DonationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all donations for an association
   */
  async findAll(associationId: string, status?: string) {
    return this.prisma.donation.findMany({
      where: {
        associationId,
        ...(status && { status }),
      },
      include: {
        beneficiary: true,
        family: true,
        processedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single donation
   */
  async findOne(id: string) {
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: {
        beneficiary: true,
        family: true,
        processedBy: { select: { id: true, name: true, email: true } },
        association: true,
      },
    });
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }
    return donation;
  }

  /**
   * Create a new donation (give aid to beneficiary)
   * Deducts from association budget and checks rules
   */
  async create(dto: CreateDonationDto, processedById?: string) {
    // Get association and check budget
    const association = await this.prisma.association.findUnique({
      where: { id: dto.associationId },
    });
    if (!association) {
      throw new NotFoundException('Association not found');
    }
    if (association.budget < dto.amount) {
      throw new BadRequestException(
        `Insufficient budget. Available: ${association.budget} TND, Requested: ${dto.amount} TND`,
      );
    }

    // Get beneficiary and their family
    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { id: dto.beneficiaryId },
      include: { family: true },
    });
    if (!beneficiary) {
      throw new NotFoundException('Beneficiary not found');
    }
    if (beneficiary.status !== 'ELIGIBLE') {
      throw new BadRequestException('Beneficiary is not eligible for donations');
    }

    const familyId = beneficiary.familyId;
    const family = beneficiary.family;

    // Get all active rules for this association
    const rules = await this.prisma.donationRule.findMany({
      where: { associationId: dto.associationId, isActive: true },
    });

    // Check FREQUENCY rule (cooldown)
    const cooldownRule = rules.find((r) => r.type === 'FREQUENCY');
    if (cooldownRule && familyId && family?.lastDonationDate) {
      const endDate = new Date(family.lastDonationDate);
      endDate.setDate(endDate.getDate() + cooldownRule.value);
      if (new Date() < endDate) {
        throw new BadRequestException(
          `Family is in cooldown period. Wait ${cooldownRule.value} ${cooldownRule.unit || 'days'} between donations.`,
        );
      }
    }

    // Check AMOUNT rule (max per family member)
    const amountRule = rules.find((r) => r.type === 'AMOUNT');
    if (amountRule && family) {
      const maxAmount = amountRule.value * family.memberCount;
      if (dto.amount > maxAmount) {
        throw new BadRequestException(
          `Amount exceeds maximum for this family (${amountRule.value} TND × ${family.memberCount} members = ${maxAmount} TND max).`,
        );
      }
    }

    // Check ELIGIBILITY rule (minimum family members)
    const eligibilityRule = rules.find((r) => r.type === 'ELIGIBILITY');
    if (eligibilityRule && family) {
      if (family.memberCount < eligibilityRule.value) {
        throw new BadRequestException(
          `Family does not meet minimum member requirement (${eligibilityRule.value} members).`,
        );
      }
    }

    // Create donation and update all related records in a transaction
    const [donation] = await this.prisma.$transaction([
      // Create the donation
      this.prisma.donation.create({
        data: {
          amount: dto.amount,
          currency: dto.currency || 'TND',
          status: 'COMPLETED',
          aidType: dto.aidType || 'CASH',
          notes: dto.notes,
          associationId: dto.associationId,
          beneficiaryId: dto.beneficiaryId,
          familyId: familyId,
          processedById: processedById,
        },
        include: {
          beneficiary: true,
          family: true,
        },
      }),
      // Deduct from association budget
      this.prisma.association.update({
        where: { id: dto.associationId },
        data: {
          budget: { decrement: dto.amount },
        },
      }),
      // Update beneficiary stats
      this.prisma.beneficiary.update({
        where: { id: dto.beneficiaryId },
        data: {
          lastDonationDate: new Date(),
          totalReceived: { increment: dto.amount },
        },
      }),
      // Update family stats and set cooldown
      ...(familyId ? [
        this.prisma.family.update({
          where: { id: familyId },
          data: {
            lastDonationDate: new Date(),
            totalReceived: { increment: dto.amount },
            status: 'COOLDOWN',
          },
        }),
      ] : []),
    ]);

    return donation;
  }

  /**
   * Get donation statistics for an association
   */
  async getStats(associationId: string) {
    const [association, totalDonations, donationsByType] = await Promise.all([
      this.prisma.association.findUnique({
        where: { id: associationId },
        select: { budget: true },
      }),
      this.prisma.donation.aggregate({
        where: { associationId, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.donation.groupBy({
        by: ['aidType'],
        where: { associationId, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      budget: association?.budget || 0,
      totalAmount: totalDonations._sum.amount || 0,
      totalCount: totalDonations._count,
      byAidType: donationsByType.map((item) => ({
        aidType: item.aidType,
        amount: item._sum.amount || 0,
        count: item._count,
      })),
    };
  }

  /**
   * Get eligible beneficiaries for donations
   */
  async getEligibleBeneficiaries(associationId: string) {
    const beneficiaries = await this.prisma.beneficiary.findMany({
      where: {
        associationId,
        status: 'ELIGIBLE',
      },
      include: {
        family: true,
      },
    });

    // Get cooldown rule
    const cooldownRule = await this.prisma.donationRule.findFirst({
      where: { associationId, type: 'FREQUENCY', isActive: true },
    });
    const cooldownDays = cooldownRule?.value || 30;

    // Check each beneficiary's family cooldown status
    const eligibleBeneficiaries = beneficiaries.map((b) => {
      let canReceive = true;
      let cooldownEnds = null;
      
      if (b.family?.lastDonationDate) {
        const endDate = new Date(b.family.lastDonationDate);
        endDate.setDate(endDate.getDate() + cooldownDays);
        if (new Date() < endDate) {
          canReceive = false;
          cooldownEnds = endDate;
        }
      }
      
      return {
        ...b,
        canReceive,
        cooldownEnds,
      };
    });

    return eligibleBeneficiaries;
  }

  /**
   * Cancel a donation (restore budget)
   */
  async cancel(id: string) {
    const donation = await this.findOne(id);
    
    if (donation.status === 'CANCELLED') {
      throw new BadRequestException('Donation is already cancelled');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.donation.update({
        where: { id },
        data: { status: 'CANCELLED' },
      }),
      // Restore budget
      this.prisma.association.update({
        where: { id: donation.associationId },
        data: { budget: { increment: donation.amount } },
      }),
      // Restore beneficiary stats
      this.prisma.beneficiary.update({
        where: { id: donation.beneficiaryId },
        data: { totalReceived: { decrement: donation.amount } },
      }),
      // Restore family stats
      ...(donation.familyId ? [
        this.prisma.family.update({
          where: { id: donation.familyId },
          data: { 
            totalReceived: { decrement: donation.amount },
            status: 'ELIGIBLE',
          },
        }),
      ] : []),
    ]);

    return updated;
  }

  async delete(id: string) {
    return this.prisma.donation.delete({ where: { id } });
  }
}
