import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamiliesService } from '../families/families.service';
import { RulesService } from '../rules/rules.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';

@Injectable()
export class DispatchesService {
  constructor(
    private prisma: PrismaService,
    private familiesService: FamiliesService,
    private rulesService: RulesService,
  ) {}

  /**
   * Get all dispatches for an association
   */
  async findAll(associationId: string, status?: string) {
    return this.prisma.dispatch.findMany({
      where: {
        associationId,
        ...(status && { status }),
      },
      include: {
        beneficiary: true,
        family: true,
        processedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single dispatch
   */
  async findOne(id: string) {
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id },
      include: {
        beneficiary: true,
        family: true,
        processedBy: { select: { id: true, name: true } },
        association: { select: { id: true, name: true, budget: true } },
      },
    });
    if (!dispatch) {
      throw new NotFoundException('Dispatch not found');
    }
    return dispatch;
  }

  /**
   * Create and complete a dispatch (give aid to beneficiary)
   * Deducts from association budget
   */
  async create(dto: CreateDispatchDto, processedById: string) {
    // Get association and check budget
    const association = await this.prisma.association.findUnique({
      where: { id: dto.associationId },
    });
    if (!association) {
      throw new NotFoundException('Association not found');
    }

    if (association.budget < dto.amount) {
      throw new BadRequestException(
        `Insufficient budget. Available: ${association.budget} ${dto.currency || 'TND'}, Requested: ${dto.amount} ${dto.currency || 'TND'}`,
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

    if (beneficiary.associationId !== dto.associationId) {
      throw new BadRequestException('Beneficiary does not belong to this association');
    }

    if (beneficiary.status !== 'ELIGIBLE') {
      throw new BadRequestException('Beneficiary is not eligible for aid');
    }

    const familyId = dto.familyId || beneficiary.familyId;

    // Check association rules
    const rules = await this.rulesService.findByAssociation(dto.associationId);
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
          `Family is in cooldown period. Must wait ${cooldownRule.value} ${cooldownRule.unit || 'days'} between aid dispatches.`,
        );
      }
    }

    // Check AMOUNT rule (max dispatch amount)
    const amountRule = activeRules.find((r) => r.type === 'AMOUNT');
    if (amountRule && dto.amount > amountRule.value) {
      throw new BadRequestException(
        `Dispatch amount exceeds maximum allowed (${amountRule.value} ${amountRule.unit || 'TND'}).`,
      );
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

    // Create dispatch, update budget, and update beneficiary/family stats in a transaction
    const [dispatch] = await this.prisma.$transaction([
      // Create the dispatch record
      this.prisma.dispatch.create({
        data: {
          amount: dto.amount,
          currency: dto.currency || 'TND',
          aidType: dto.aidType || 'CASH',
          notes: dto.notes,
          status: 'COMPLETED',
          completedAt: new Date(),
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
      // Update family stats
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

    return dispatch;
  }

  /**
   * Get dispatch stats for an association
   */
  async getStats(associationId: string) {
    const [association, total, byAidType] = await Promise.all([
      this.prisma.association.findUnique({
        where: { id: associationId },
        select: { budget: true },
      }),
      this.prisma.dispatch.aggregate({
        where: { associationId, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.dispatch.groupBy({
        by: ['aidType'],
        where: { associationId, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      budget: association?.budget || 0,
      totalAmount: total._sum.amount || 0,
      totalCount: total._count,
      byAidType: byAidType.map((item) => ({
        type: item.aidType,
        amount: item._sum.amount || 0,
        count: item._count,
      })),
    };
  }

  /**
   * Get eligible beneficiaries for dispatch
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
      orderBy: { lastName: 'asc' },
    });

    // Check cooldown status for each
    const rules = await this.rulesService.findByAssociation(associationId);
    const cooldownRule = rules.find((r) => r.type === 'FREQUENCY' && r.isActive);

    const results = await Promise.all(
      beneficiaries.map(async (b) => {
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
          ...b,
          canReceive,
          cooldownEnds,
        };
      }),
    );

    return results;
  }
}
