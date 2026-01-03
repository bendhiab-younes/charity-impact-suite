import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  async findAll(associationId: string) {
    return this.prisma.family.findMany({
      where: { associationId },
      include: {
        beneficiaries: true,
        _count: { select: { beneficiaries: true, donations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const family = await this.prisma.family.findUnique({
      where: { id },
      include: {
        beneficiaries: true,
        donations: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    return family;
  }

  async create(dto: CreateFamilyDto) {
    return this.prisma.family.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateFamilyDto) {
    const family = await this.prisma.family.findUnique({ where: { id } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    return this.prisma.family.update({
      where: { id },
      data: dto,
    });
  }

  async checkCooldown(id: string, cooldownDays: number): Promise<boolean> {
    const family = await this.prisma.family.findUnique({ where: { id } });
    if (!family || !family.lastDonationDate) {
      return true; // Eligible if no previous donation
    }
    const daysSinceLastDonation = Math.floor(
      (Date.now() - family.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSinceLastDonation >= cooldownDays;
  }

  async delete(id: string) {
    const family = await this.prisma.family.findUnique({ where: { id } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    return this.prisma.family.delete({ where: { id } });
  }
}
