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
    // Check cooldown if familyId is provided
    if (dto.familyId) {
      const rules = await this.rulesService.findByAssociation(dto.associationId);
      const cooldownRule = rules.find(
        (r) => r.type === 'FREQUENCY' && r.isActive,
      );
      if (cooldownRule) {
        const isEligible = await this.familiesService.checkCooldown(
          dto.familyId,
          cooldownRule.value,
        );
        if (!isEligible) {
          throw new BadRequestException(
            `Family is in cooldown period. Wait ${cooldownRule.value} days between donations.`,
          );
        }
      }
    }

    return this.prisma.donation.create({
      data: dto,
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
