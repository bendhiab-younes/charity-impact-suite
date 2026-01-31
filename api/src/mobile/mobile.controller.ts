import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MobileService } from './mobile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMobileDonationDto, DispatchDonationDto, CreateMobileContributionDto, CreateMobileDispatchDto } from './dto';

@ApiTags('Mobile')
@Controller('mobile')
export class MobileController {
  constructor(private mobileService: MobileService) {}

  // ==================== PUBLIC ENDPOINTS (No Auth Required) ====================

  @Get('associations')
  @ApiOperation({ 
    summary: 'Get all active associations for public browsing',
    description: 'Returns a list of all active associations with basic info for mobile app browsing. No authentication required.',
  })
  @ApiResponse({ status: 200, description: 'List of active associations' })
  async getPublicAssociations() {
    return this.mobileService.getPublicAssociations();
  }

  @Get('associations/:id')
  @ApiOperation({ 
    summary: 'Get association details by ID',
    description: 'Returns detailed information about a specific association including donation statistics.',
  })
  @ApiParam({ name: 'id', description: 'Association ID' })
  @ApiResponse({ status: 200, description: 'Association details with stats' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async getAssociationDetails(@Param('id') id: string) {
    return this.mobileService.getAssociationDetails(id);
  }

  // ==================== DONOR ENDPOINTS ====================

  @Post('donate')
  @ApiOperation({ 
    summary: 'Create a donation (anonymous)',
    description: 'Create a donation without authentication. Donation will be in PENDING status until approved by association admin.',
  })
  @ApiBody({ type: CreateMobileDonationDto })
  @ApiResponse({ status: 201, description: 'Donation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or amount exceeds limit' })
  async createAnonymousDonation(@Body() dto: CreateMobileDonationDto) {
    return this.mobileService.createMobileDonation({
      associationId: dto.associationId,
      amount: dto.amount,
      type: dto.type,
      method: dto.method,
      notes: dto.notes,
    });
  }

  @Post('donate/auth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create a donation (authenticated)',
    description: 'Create a donation as an authenticated user. Tracks donor history.',
  })
  @ApiBody({ type: CreateMobileDonationDto })
  @ApiResponse({ status: 201, description: 'Donation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or amount exceeds limit' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAuthenticatedDonation(
    @Request() req: any,
    @Body() dto: CreateMobileDonationDto,
  ) {
    return this.mobileService.createMobileDonation({
      associationId: dto.associationId,
      amount: dto.amount,
      donorId: req.user.id,
      type: dto.type,
      method: dto.method,
      notes: dto.notes,
    });
  }

  @Get('my-donations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get donation/contribution history',
    description: 'Returns all donations and contributions made by the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'List of donations/contributions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDonorHistory(@Request() req: any) {
    return this.mobileService.getDonorHistory(req.user.id);
  }

  // ==================== NEW CONTRIBUTION ENDPOINTS ====================

  @Post('contribute')
  @ApiOperation({ 
    summary: 'Create a contribution (anonymous)',
    description: 'Create a contribution without authentication. Adds to association budget when approved.',
  })
  @ApiBody({ type: CreateMobileContributionDto })
  @ApiResponse({ status: 201, description: 'Contribution created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or amount exceeds limit' })
  async createAnonymousContribution(@Body() dto: CreateMobileContributionDto) {
    return this.mobileService.createMobileContribution({
      associationId: dto.associationId,
      amount: dto.amount,
      donorName: dto.donorName,
      donorEmail: dto.donorEmail,
      type: dto.type,
      method: dto.method,
      notes: dto.notes,
    });
  }

  @Post('contribute/auth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create a contribution (authenticated)',
    description: 'Create a contribution as an authenticated user. Tracks in your contribution history.',
  })
  @ApiBody({ type: CreateMobileContributionDto })
  @ApiResponse({ status: 201, description: 'Contribution created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or amount exceeds limit' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAuthenticatedContribution(
    @Request() req: any,
    @Body() dto: CreateMobileContributionDto,
  ) {
    return this.mobileService.createMobileContribution({
      associationId: dto.associationId,
      amount: dto.amount,
      donorId: req.user.id,
      type: dto.type,
      method: dto.method,
      notes: dto.notes,
    });
  }

  @Get('my-contributions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get contribution history',
    description: 'Returns all contributions made by the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'List of contributions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDonorContributions(@Request() req: any) {
    return this.mobileService.getDonorContributions(req.user.id);
  }

  // ==================== NEW DISPATCH ENDPOINTS ====================

  @Get('dispatch/budget')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get association budget',
    description: 'Returns the current available budget for dispatching aid.',
  })
  @ApiResponse({ status: 200, description: 'Budget information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAssociationBudget(@Request() req: any) {
    if (!req.user.associationId) {
      return { error: 'No association linked to your account' };
    }
    return this.mobileService.getAssociationBudget(req.user.associationId);
  }

  @Get('dispatch/eligible')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get eligible beneficiaries for dispatch',
    description: 'Returns beneficiaries who can receive aid (checking cooldown periods and eligibility).',
  })
  @ApiResponse({ status: 200, description: 'List of eligible beneficiaries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEligibleForDispatch(@Request() req: any) {
    if (!req.user.associationId) {
      return { error: 'No association linked to your account' };
    }
    return this.mobileService.getEligibleBeneficiariesForDispatch(req.user.associationId);
  }

  @Post('dispatch/aid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Dispatch aid to a beneficiary',
    description: 'Creates a dispatch record, deducts from association budget, and updates beneficiary stats. Enforces all rules.',
  })
  @ApiBody({ type: CreateMobileDispatchDto })
  @ApiResponse({ status: 201, description: 'Aid dispatched successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient budget or rule violation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async dispatchAid(@Request() req: any, @Body() dto: CreateMobileDispatchDto) {
    if (!req.user.associationId) {
      return { error: 'No association linked to your account' };
    }
    return this.mobileService.createDispatch({
      associationId: req.user.associationId,
      beneficiaryId: dto.beneficiaryId,
      amount: dto.amount,
      aidType: dto.aidType,
      familyId: dto.familyId,
      notes: dto.notes,
      processedById: req.user.id,
    });
  }

  @Get('dispatch/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get dispatch history',
    description: 'Returns all dispatches made by the association.',
  })
  @ApiResponse({ status: 200, description: 'List of dispatches' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDispatchHistory(@Request() req: any) {
    if (!req.user.associationId) {
      return { error: 'No association linked to your account' };
    }
    return this.mobileService.getDispatchHistory(req.user.associationId);
  }

  // ==================== ASSOCIATION MEMBER/ADMIN ENDPOINTS (Legacy) ====================

  @Get('dispatch/beneficiaries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get eligible beneficiaries',
    description: 'Returns list of eligible beneficiaries for the user\'s association. Used for selecting recipients when dispatching donations.',
  })
  @ApiResponse({ status: 200, description: 'List of eligible beneficiaries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getBeneficiariesForDispatch(@Request() req: any) {
    if (!req.user.associationId) {
      return { error: 'No association linked to your account' };
    }
    return this.mobileService.getBeneficiariesForDispatch(req.user.associationId);
  }

  @Get('dispatch/donations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get donations to dispatch',
    description: 'Returns pending and approved donations that can be dispatched to beneficiaries.',
  })
  @ApiResponse({ status: 200, description: 'List of pending/approved donations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getPendingDonations(@Request() req: any) {
    if (!req.user.associationId) {
      return { error: 'No association linked to your account' };
    }
    return this.mobileService.getPendingDonations(req.user.associationId);
  }

  @Post('dispatch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Dispatch a donation',
    description: 'Assigns a donation to a beneficiary and marks it as completed. Enforces cooldown and eligibility rules.',
  })
  @ApiBody({ type: DispatchDonationDto })
  @ApiResponse({ status: 200, description: 'Donation dispatched successfully' })
  @ApiResponse({ status: 400, description: 'Rule violation (cooldown, eligibility, etc.)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Donation or beneficiary not found' })
  async dispatchDonation(@Request() req: any, @Body() dto: DispatchDonationDto) {
    if (!req.user.associationId) {
      return { error: 'No association linked to your account' };
    }
    return this.mobileService.dispatchDonation({
      donationId: dto.donationId,
      beneficiaryId: dto.beneficiaryId,
      associationId: req.user.associationId,
      dispatchedBy: req.user.id,
    });
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get dashboard statistics',
    description: 'Returns aggregated statistics for the user\'s association including donation totals, beneficiary counts, and family counts.',
  })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getAssociationDashboard(@Request() req: any) {
    if (!req.user.associationId) {
      return { error: 'No association linked to your account' };
    }
    return this.mobileService.getAssociationDashboard(req.user.associationId);
  }
}
