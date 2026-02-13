import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BeneficiariesService } from './beneficiaries.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Beneficiaries')
@Controller('beneficiaries')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BeneficiariesController {
  constructor(private beneficiariesService: BeneficiariesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Get all beneficiaries for an association' })
  async findAll(@Query('associationId') associationId: string, @Request() req: any) {
    const targetAssociationId = req.user.role === 'SUPER_ADMIN' ? associationId : req.user.associationId;
    return this.beneficiariesService.findAll(targetAssociationId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Get beneficiary by ID' })
  async findOne(@Param('id') id: string) {
    return this.beneficiariesService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Create a new beneficiary' })
  async create(@Body() dto: CreateBeneficiaryDto, @Request() req: any) {
    if (req.user.role !== 'SUPER_ADMIN' && req.user.associationId) {
      dto.associationId = req.user.associationId;
    }
    return this.beneficiariesService.create(dto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Update a beneficiary' })
  async update(@Param('id') id: string, @Body() dto: UpdateBeneficiaryDto) {
    return this.beneficiariesService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Update beneficiary status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.beneficiariesService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Delete a beneficiary' })
  async remove(@Param('id') id: string) {
    return this.beneficiariesService.delete(id);
  }
}
