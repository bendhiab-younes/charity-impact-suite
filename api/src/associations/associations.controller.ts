import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Associations')
@Controller('associations')
export class AssociationsController {
  constructor(private associationsService: AssociationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all associations (public)' })
  async findAll() {
    return this.associationsService.findAll();
  }

  @Get('public-stats')
  @ApiOperation({ summary: 'Get aggregated platform statistics (public)' })
  async getPublicStats() {
    return this.associationsService.getPublicStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get association by ID (public)' })
  async findOne(@Param('id') id: string) {
    return this.associationsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new association' })
  async create(@Body() dto: CreateAssociationDto) {
    return this.associationsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an association' })
  async update(@Param('id') id: string, @Body() dto: UpdateAssociationDto) {
    return this.associationsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an association' })
  async remove(@Param('id') id: string) {
    return this.associationsService.delete(id);
  }
}
