import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

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
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.delete({ where: { id } });
  }

  async createUser(dto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role || 'ASSOCIATION_MEMBER',
        associationId: dto.associationId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        associationId: true,
        createdAt: true,
      },
    });

    return user;
  }
}
