import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamiliesService } from '../families/families.service';
import { RulesService } from '../rules/rules.service';
import { CreateDonationDto } from './dto/create-donation.dto';

@Injectable()
export class DonationsService {
  constructor(
    private prisma: PrismaService,
    private familiesService: FamiliesService,
    private rulesService: RulesService,
  ) {}

  async findAll(associationId: string, status?: string) {
    return this.prisma.donation.findMany({
      where: {
        associationId,
        ...(status && { status: status as any }),
      },
      include: {
        beneficiary: true,
        family: true,
        donor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: {
        beneficiary: true,
        family: true,
        donor: { select: { id: true, name: true, email: true } },
        association: true,
      },
    });
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }
    return donation;
  }

  async create(dto: CreateDonationDto) {
    // Get familyId from beneficiary if not provided directly
    let familyId = dto.familyId;
    if (!familyId && dto.beneficiaryId) {
      const beneficiary = await this.prisma.beneficiary.findUnique({
        where: { id: dto.beneficiaryId },
        select: { familyId: true },
      });
      if (beneficiary) {
        familyId = beneficiary.familyId;
      }
    }

    // Get all active rules for this association
    const rules = await this.rulesService.findByAssociation(dto.associationId);
    const activeRules = rules.filter((r) => r.isActive);

    // Check FREQUENCY rule (cooldown)
    if (familyId) {
      const cooldownRule = activeRules.find((r) => r.type === 'FREQUENCY');
      if (cooldownRule) {
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
    }

    // Check AMOUNT rule (max donation amount)
    const amountRule = activeRules.find((r) => r.type === 'AMOUNT');
    if (amountRule && dto.amount > amountRule.value) {
      throw new BadRequestException(
        `Donation amount exceeds maximum allowed (${amountRule.value} ${amountRule.unit || 'TND'}).`,
      );
    }

    // Check ELIGIBILITY rule (minimum family members)
    if (familyId) {
      const eligibilityRule = activeRules.find((r) => r.type === 'ELIGIBILITY');
      if (eligibilityRule && eligibilityRule.unit === 'members') {
        const family = await this.prisma.family.findUnique({
          where: { id: familyId },
          select: { memberCount: true },
        });
        if (family && family.memberCount < eligibilityRule.value) {
          throw new BadRequestException(
            `Family does not meet minimum member requirement (${eligibilityRule.value} members).`,
          );
        }
      }
    }

    // Include familyId in the donation data if resolved from beneficiary
    const donationData = {
      ...dto,
      familyId: familyId || dto.familyId,
    };

    return this.prisma.donation.create({
      data: donationData,
      include: { beneficiary: true, family: true },
    });
  }

  async approve(id: string) {
    const donation = await this.findOne(id);

    const updated = await this.prisma.donation.update({
      where: { id },
      data: {
        status: 'APPROVED',
        processedAt: new Date(),
      },
    });

    // Update family last donation date and total
    if (donation.familyId) {
      await this.prisma.family.update({
        where: { id: donation.familyId },
        data: {
          lastDonationDate: new Date(),
          totalReceived: { increment: donation.amount },
          status: 'COOLDOWN',
        },
      });
    }

    // Update beneficiary total if applicable
    if (donation.beneficiaryId) {
      await this.prisma.beneficiary.update({
        where: { id: donation.beneficiaryId },
        data: {
          lastDonationDate: new Date(),
          totalReceived: { increment: donation.amount },
        },
      });
    }

    return updated;
  }

  async reject(id: string, reason?: string) {
    return this.prisma.donation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
        notes: reason,
      },
    });
  }

  async complete(id: string) {
    return this.prisma.donation.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.donation.delete({ where: { id } });
  }
}
