import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  /**
   * Get all contributions for an association (admin/member only)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  async findAll(
    @Query('associationId') associationId: string,
    @Query('status') status?: string,
  ) {
    return this.contributionsService.findAll(associationId, status);
  }

  /**
   * Get my contributions as a donor
   */
  @Get('my-contributions')
  @UseGuards(JwtAuthGuard)
  async getMyContributions(@CurrentUser() user: any) {
    return this.contributionsService.findByDonor(user.id);
  }

  /**
   * Get contribution stats for an association
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  async getStats(@Query('associationId') associationId: string) {
    return this.contributionsService.getStats(associationId);
  }

  /**
   * Get a specific contribution
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.contributionsService.findOne(id);
  }

  /**
   * Create a new contribution (donor or anonymous)
   */
  @Post()
  async create(@Body() dto: CreateContributionDto, @CurrentUser() user?: any) {
    // If user is logged in and no donorId provided, use current user
    if (user && !dto.donorId) {
      dto.donorId = user.id;
    }
    return this.contributionsService.create(dto);
  }

  /**
   * Approve a contribution (admin only)
   */
  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  async approve(@Param('id') id: string) {
    return this.contributionsService.approve(id);
  }

  /**
   * Reject a contribution (admin only)
   */
  @Put(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  async reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.contributionsService.reject(id, reason);
  }
}
