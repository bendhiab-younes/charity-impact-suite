import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(associationId: string, limit?: number) {
    return this.prisma.activityLog.findMany({
      where: { associationId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit || 100,
    });
  }

  async create(data: {
    action: string;
    details: string;
    entityType: string;
    entityId: string;
    associationId: string;
    userId: string;
  }) {
    return this.prisma.activityLog.create({
      data,
    });
  }

  async log(
    userId: string,
    associationId: string,
    action: string,
    entityType: string,
    entityId: string,
    details: string,
  ) {
    return this.create({
      action,
      details,
      entityType,
      entityId,
      associationId,
      userId,
    });
  }
}
