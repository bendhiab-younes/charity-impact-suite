import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  async findByAssociation(associationId: string) {
    return this.prisma.donationRule.findMany({
      where: { associationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const rule = await this.prisma.donationRule.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException('Rule not found');
    }
    return rule;
  }

  async create(dto: CreateRuleDto) {
    return this.prisma.donationRule.create({ data: dto });
  }

  async update(id: string, dto: UpdateRuleDto) {
    return this.prisma.donationRule.update({
      where: { id },
      data: dto,
    });
  }

  async toggleActive(id: string) {
    const rule = await this.findOne(id);
    return this.prisma.donationRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });
  }

  async delete(id: string) {
    return this.prisma.donationRule.delete({ where: { id } });
  }
}
