import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * DonationsController - Handles AID DISTRIBUTION (money OUT to beneficiaries)
 * 
 * Only association staff (admin/member) can create donations.
 * Donations use the association's budget from approved contributions.
 */
@ApiTags('Donations (Aid Out)')
@Controller('donations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Get all donations for an association' })
  @ApiQuery({ name: 'associationId', required: true })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('associationId') associationId: string,
    @Query('status') status?: string,
  ) {
    return this.donationsService.findAll(associationId, status);
  }

  @Get('stats')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Get donation statistics (budget, total distributed, etc.)' })
  async getStats(@Request() req: any) {
    const associationId = req.user.associationId;
    if (!associationId) {
      return { budget: 0, totalDistributed: 0, beneficiariesHelped: 0, pendingDonations: 0 };
    }
    return this.donationsService.getStats(associationId);
  }

  @Get('eligible-beneficiaries')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Get beneficiaries eligible for donations (with cooldown info)' })
  async getEligibleBeneficiaries(@Request() req: any) {
    // Use the association from the logged-in user
    const associationId = req.user.associationId;
    if (!associationId) {
      return [];
    }
    return this.donationsService.getEligibleBeneficiaries(associationId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Get donation by ID' })
  async findOne(@Param('id') id: string) {
    return this.donationsService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ 
    summary: 'Create a donation (give aid to beneficiary)',
    description: 'Creates a donation from the association budget to a beneficiary. Checks all rules (cooldown, amount limits, eligibility).'
  })
  async create(@Body() dto: CreateDonationDto, @Request() req: any) {
    return this.donationsService.create(dto, req.user.id);
  }

  @Patch(':id/cancel')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Cancel a donation (restores budget)' })
  async cancel(@Param('id') id: string) {
    return this.donationsService.cancel(id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Delete a donation' })
  async remove(@Param('id') id: string) {
    return this.donationsService.delete(id);
  }
}
