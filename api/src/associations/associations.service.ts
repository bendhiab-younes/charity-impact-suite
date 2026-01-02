import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';

@Injectable()
export class AssociationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const associations = await this.prisma.association.findMany({
      include: {
        _count: {
          select: {
            users: true,
            beneficiaries: true,
            donations: true,
          },
        },
      },
    });

    return associations.map((a) => ({
      ...a,
      totalMembers: a._count.users,
      totalBeneficiaries: a._count.beneficiaries,
      totalDonations: a._count.donations,
    }));
  }

  async findOne(id: string) {
    const association = await this.prisma.association.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            beneficiaries: true,
            families: true,
            donations: true,
          },
        },
        donations: {
          where: { status: 'COMPLETED' },
          select: { amount: true },
        },
      },
    });

    if (!association) {
      throw new NotFoundException('Association not found');
    }

    const totalDonationAmount = association.donations.reduce(
      (sum, d) => sum + d.amount,
      0,
    );

    return {
      ...association,
      totalMembers: association._count.users,
      totalBeneficiaries: association._count.beneficiaries,
      totalFamilies: association._count.families,
      totalDonations: totalDonationAmount,
      donationsCount: association._count.donations,
    };
  }

  async create(dto: CreateAssociationDto) {
    return this.prisma.association.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateAssociationDto) {
    return this.prisma.association.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    return this.prisma.association.delete({ where: { id } });
  }
}
