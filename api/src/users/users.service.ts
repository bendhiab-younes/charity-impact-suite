import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { association: true },
    });
  }

  async create(data: RegisterDto & { password: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        associationId: data.associationId,
      },
    });
  }

  async findAll(associationId?: string) {
    return this.prisma.user.findMany({
      where: associationId ? { associationId } : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        associationId: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: Partial<RegisterDto>) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
