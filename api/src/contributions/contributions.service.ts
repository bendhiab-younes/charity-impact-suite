import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContributionDto } from './dto/create-contribution.dto';

@Injectable()
export class ContributionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all contributions for an association
   */
  async findAll(associationId: string, status?: string) {
    return this.prisma.contribution.findMany({
      where: {
        associationId,
        ...(status && { status }),
      },
      include: {
        donor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get contributions made by a specific donor
   */
  async findByDonor(donorId: string) {
    return this.prisma.contribution.findMany({
      where: { donorId },
      include: {
        association: { select: { id: true, name: true, logo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single contribution
   */
  async findOne(id: string) {
    const contribution = await this.prisma.contribution.findUnique({
      where: { id },
      include: {
        donor: { select: { id: true, name: true, email: true } },
        association: { select: { id: true, name: true } },
      },
    });
    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }
    return contribution;
  }

  /**
   * Create a new contribution (donor donating to association)
   */
  async create(dto: CreateContributionDto) {
    // Verify association exists
    const association = await this.prisma.association.findUnique({
      where: { id: dto.associationId },
    });
    if (!association) {
      throw new NotFoundException('Association not found');
    }

    return this.prisma.contribution.create({
      data: {
        amount: dto.amount,
        currency: dto.currency || 'TND',
        type: dto.type || 'ONE_TIME',
        method: dto.method || 'CARD',
        notes: dto.notes,
        associationId: dto.associationId,
        donorId: dto.donorId,
        donorName: dto.donorName,
        donorEmail: dto.donorEmail,
        status: 'PENDING',
      },
      include: {
        donor: { select: { id: true, name: true, email: true } },
        association: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Approve a contribution and add to association's budget
   */
  async approve(id: string) {
    const contribution = await this.findOne(id);

    if (contribution.status !== 'PENDING') {
      throw new BadRequestException('Only pending contributions can be approved');
    }

    // Update contribution status and add to association budget
    const [updated] = await this.prisma.$transaction([
      this.prisma.contribution.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
        },
      }),
      this.prisma.association.update({
        where: { id: contribution.associationId },
        data: {
          budget: { increment: contribution.amount },
        },
      }),
    ]);

    return updated;
  }

  /**
   * Reject a contribution
   */
  async reject(id: string, reason?: string) {
    const contribution = await this.findOne(id);

    if (contribution.status !== 'PENDING') {
      throw new BadRequestException('Only pending contributions can be rejected');
    }

    return this.prisma.contribution.update({
      where: { id },
      data: {
        status: 'REJECTED',
        notes: reason 
          ? `${contribution.notes || ''}\nRejected: ${reason}`.trim()
          : contribution.notes,
      },
    });
  }

  /**
   * Get total contributions stats for an association
   */
  async getStats(associationId: string) {
    const [total, pending, approved] = await Promise.all([
      this.prisma.contribution.aggregate({
        where: { associationId },
        _sum: { amount: true },
        _count: true,
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
    ]);

    return {
      total: {
        amount: total._sum.amount || 0,
        count: total._count,
      },
      pending: {
        amount: pending._sum.amount || 0,
        count: pending._count,
      },
      approved: {
        amount: approved._sum.amount || 0,
        count: approved._count,
      },
    };
  }
}
