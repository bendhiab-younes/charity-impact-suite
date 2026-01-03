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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MobileService } from './mobile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMobileDonationDto, DispatchDonationDto } from './dto';

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
    summary: 'Get donation history',
    description: 'Returns all donations made by the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'List of donations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDonorHistory(@Request() req: any) {
    return this.mobileService.getDonorHistory(req.user.id);
  }

  // ==================== ASSOCIATION MEMBER/ADMIN ENDPOINTS ====================

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
