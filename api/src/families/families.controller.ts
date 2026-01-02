import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Families')
@Controller('families')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FamiliesController {
  constructor(private familiesService: FamiliesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Get all families for an association' })
  async findAll(@Query('associationId') associationId: string) {
    return this.familiesService.findAll(associationId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Get family by ID' })
  async findOne(@Param('id') id: string) {
    return this.familiesService.findOne(id);
  }

  @Get(':id/cooldown')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Check if family is eligible (cooldown passed)' })
  async checkCooldown(
    @Param('id') id: string,
    @Query('days') days: string,
  ) {
    const isEligible = await this.familiesService.checkCooldown(id, parseInt(days) || 30);
    return { isEligible };
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Create a new family' })
  async create(@Body() dto: CreateFamilyDto) {
    return this.familiesService.create(dto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Update a family' })
  async update(@Param('id') id: string, @Body() dto: UpdateFamilyDto) {
    return this.familiesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Delete a family' })
  async remove(@Param('id') id: string) {
    return this.familiesService.delete(id);
  }
}
