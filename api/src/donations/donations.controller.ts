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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Donations')
@Controller('donations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER', 'DONOR')
  @ApiOperation({ summary: 'Get all donations for an association' })
  async findAll(
    @Query('associationId') associationId: string,
    @Query('status') status?: string,
  ) {
    return this.donationsService.findAll(associationId, status);
  }

  @Get('my-donations')
  @Roles('DONOR', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Get all donations made by the current user' })
  async findMyDonations(@Request() req: any) {
    return this.donationsService.findByDonor(req.user.id);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER', 'DONOR')
  @ApiOperation({ summary: 'Get donation by ID' })
  async findOne(@Param('id') id: string) {
    return this.donationsService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER', 'DONOR')
  @ApiOperation({ summary: 'Create a new donation' })
  async create(@Body() dto: CreateDonationDto) {
    return this.donationsService.create(dto);
  }

  @Patch(':id/approve')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Approve a pending donation' })
  async approve(@Param('id') id: string) {
    return this.donationsService.approve(id);
  }

  @Patch(':id/reject')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Reject a pending donation' })
  async reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.donationsService.reject(id, reason);
  }

  @Patch(':id/complete')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Mark donation as completed' })
  async complete(@Param('id') id: string) {
    return this.donationsService.complete(id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Delete a donation' })
  async remove(@Param('id') id: string) {
    return this.donationsService.delete(id);
  }
}
