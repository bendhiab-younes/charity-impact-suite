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
            families: true,
            donations: true,
            contributions: true,
          },
        },
        contributions: {
          where: { status: 'APPROVED' },
          select: { amount: true },
        },
        donations: {
          where: { status: 'COMPLETED' },
          select: { amount: true, aidType: true },
        },
      },
    });

    return associations.map((a) => {
      const totalRaised = a.contributions.reduce((sum, c) => sum + c.amount, 0);
      const totalDistributed = a.donations.reduce((sum, d) => sum + d.amount, 0);
      const successRate =
        a._count.donations > 0
          ? Math.round(
              (a.donations.length / a._count.donations) * 100,
            )
          : 0;

      return {
        id: a.id,
        name: a.name,
        description: a.description,
        logo: a.logo,
        website: a.website,
        email: a.email,
        phone: a.phone,
        address: a.address,
        status: a.status,
        category: a.category,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        totalMembers: a._count.users,
        totalBeneficiaries: a._count.beneficiaries,
        totalFamilies: a._count.families,
        totalDonations: a._count.donations,
        totalContributions: a._count.contributions,
        totalRaised,
        totalDistributed,
        successRate,
      };
    });
  }

  async getPublicStats() {
    const [associations, beneficiaries, contributions, donations] =
      await Promise.all([
        this.prisma.association.count(),
        this.prisma.beneficiary.count(),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          _count: true,
          where: { status: 'APPROVED' },
        }),
        this.prisma.donation.aggregate({
          _sum: { amount: true },
          _count: true,
          where: { status: 'COMPLETED' },
        }),
      ]);

    const totalDonationsCount = await this.prisma.donation.count();
    const completedDonationsCount = donations._count;
    const successRate =
      totalDonationsCount > 0
        ? Math.round((completedDonationsCount / totalDonationsCount) * 100)
        : 0;

    return {
      totalAssociations: associations,
      totalBeneficiaries: beneficiaries,
      totalRaised: contributions._sum.amount || 0,
      totalDistributed: donations._sum.amount || 0,
      totalContributions: contributions._count,
      totalDonations: donations._count,
      successRate,
    };
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
            contributions: true,
          },
        },
        contributions: {
          where: { status: 'APPROVED' },
          select: { amount: true },
        },
        donations: {
          select: { amount: true, status: true, aidType: true, createdAt: true, beneficiary: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' as const },
        },
      },
    });

    if (!association) {
      throw new NotFoundException('Association not found');
    }

    const totalRaised = association.contributions.reduce(
      (sum, c) => sum + c.amount,
      0,
    );
    const completedDonations = association.donations.filter(
      (d) => d.status === 'COMPLETED',
    );
    const totalDistributed = completedDonations.reduce(
      (sum, d) => sum + d.amount,
      0,
    );
    const successRate =
      association._count.donations > 0
        ? Math.round(
            (completedDonations.length / association._count.donations) * 100,
          )
        : 0;

    const now = new Date();
    const thisMonthDonations = completedDonations.filter((d) => {
      const date = new Date(d.createdAt);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
    const distributedThisMonth = thisMonthDonations.reduce(
      (sum, d) => sum + d.amount,
      0,
    );

    return {
      id: association.id,
      name: association.name,
      description: association.description,
      logo: association.logo,
      website: association.website,
      email: association.email,
      phone: association.phone,
      address: association.address,
      status: association.status,
      category: association.category,
      createdAt: association.createdAt,
      updatedAt: association.updatedAt,
      totalMembers: association._count.users,
      totalBeneficiaries: association._count.beneficiaries,
      totalFamilies: association._count.families,
      totalDonations: association._count.donations,
      totalContributions: association._count.contributions,
      totalRaised,
      totalDistributed,
      distributedThisMonth,
      donationsCount: association._count.donations,
      successRate,
      recentDonations: association.donations.slice(0, 5).map((d) => ({
        amount: d.amount,
        status: d.status,
        aidType: d.aidType,
        createdAt: d.createdAt,
        beneficiary: d.beneficiary,
      })),
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
