import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';

@Injectable()
export class BeneficiariesService {
  constructor(private prisma: PrismaService) {}

  async findAll(associationId: string) {
    return this.prisma.beneficiary.findMany({
      where: { associationId },
      include: { family: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { id },
      include: { family: true, donations: true },
    });
    if (!beneficiary) {
      throw new NotFoundException('Beneficiary not found');
    }
    return beneficiary;
  }

  async create(dto: CreateBeneficiaryDto) {
    return this.prisma.beneficiary.create({
      data: dto,
      include: { family: true },
    });
  }

  async update(id: string, dto: UpdateBeneficiaryDto) {
    return this.prisma.beneficiary.update({
      where: { id },
      data: dto,
      include: { family: true },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.beneficiary.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async delete(id: string) {
    return this.prisma.beneficiary.delete({ where: { id } });
  }
}
