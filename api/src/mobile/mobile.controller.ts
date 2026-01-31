import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MobileService } from './mobile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { 
  CreateContributionDto, 
  ApproveContributionDto,
  DispatchByNationalIdDto,
  DispatchByIdDto,
  // Legacy
  CreateMobileDonationDto, 
  DispatchDonationDto 
} from './dto';

@ApiTags('Mobile API')
@Controller('mobile')
export class MobileController {
  constructor(private mobileService: MobileService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS - No Authentication Required
  // ============================================================================

  @Get('associations')
  @ApiOperation({ 
    summary: 'List all active associations',
    description: 'Returns active associations for donors to browse and choose where to donate.',
  })
  @ApiResponse({ status: 200, description: 'List of active associations' })
  async getAssociations() {
    return this.mobileService.getPublicAssociations();
  }

  @Get('associations/:id')
  @ApiOperation({ 
    summary: 'Get association details',
    description: 'Returns detailed info about an association including donation stats.',
  })
  @ApiParam({ name: 'id', description: 'Association ID' })
  @ApiResponse({ status: 200, description: 'Association details' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getAssociationDetails(@Param('id') id: string) {
    return this.mobileService.getAssociationDetails(id);
  }

  // ============================================================================
  // DONOR ENDPOINTS - Anonymous or Authenticated
  // ============================================================================

  @Post('donate')
  @ApiOperation({ 
    summary: 'Make a donation (anonymous)',
    description: 'Create a contribution without logging in. Status will be PENDING until approved by association.',
  })
  @ApiBody({ type: CreateContributionDto })
  @ApiResponse({ status: 201, description: 'Donation created, pending approval' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async donateAnonymous(@Body() dto: CreateContributionDto) {
    return this.mobileService.createContribution({
      associationId: dto.associationId,
      amount: dto.amount,
      donorName: dto.donorName,
      donorEmail: dto.donorEmail,
      type: dto.type,
      method: dto.method,
      notes: dto.notes,
    });
  }

  @Post('donate/auth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Make a donation (authenticated)',
    description: 'Create a contribution as logged-in user. Tracks in donation history.',
  })
  @ApiBody({ type: CreateContributionDto })
  @ApiResponse({ status: 201, description: 'Donation created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async donateAuthenticated(@Request() req: any, @Body() dto: CreateContributionDto) {
    return this.mobileService.createContribution({
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
    summary: 'Get my donation history',
    description: 'Returns all donations made by the logged-in user.',
  })
  @ApiResponse({ status: 200, description: 'Donation history' })
  async getMyDonations(@Request() req: any) {
    return this.mobileService.getDonorContributions(req.user.id);
  }

  // ============================================================================
  // STAFF ENDPOINTS - Member/Admin (Approve Donations)
  // ============================================================================

  @Get('contributions/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get pending contributions',
    description: 'Returns contributions waiting for approval.',
  })
  @ApiResponse({ status: 200, description: 'List of pending contributions' })
  async getPendingContributions(@Request() req: any) {
    if (!req.user.associationId) {
      return { error: 'No association linked' };
    }
    return this.mobileService.getPendingContributions(req.user.associationId);
  }

  @Patch('contributions/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Approve or reject a contribution',
    description: 'Admin approves/rejects a pending donation. Approved donations add to budget.',
  })
  @ApiBody({ type: ApproveContributionDto })
  @ApiResponse({ status: 200, description: 'Contribution updated' })
  @ApiResponse({ status: 400, description: 'Invalid action' })
  @ApiResponse({ status: 404, description: 'Contribution not found' })
  async approveContribution(@Request() req: any, @Body() dto: ApproveContributionDto) {
    if (!req.user.associationId) {
      return { error: 'No association linked' };
    }
    return this.mobileService.approveOrRejectContribution({
      contributionId: dto.contributionId,
      action: dto.action,
      reason: dto.reason,
      associationId: req.user.associationId,
      approvedById: req.user.id,
    });
  }

  // ============================================================================
  // STAFF ENDPOINTS - Member/Admin (Dispatch Aid)
  // ============================================================================

  @Get('budget')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get available budget',
    description: 'Returns current association budget available for dispatching.',
  })
  @ApiResponse({ status: 200, description: 'Budget information' })
  async getBudget(@Request() req: any) {
    if (!req.user.associationId) {
      return { error: 'No association linked' };
    }
    return this.mobileService.getAssociationBudget(req.user.associationId);
  }

  @Get('beneficiary/lookup/:nationalId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Lookup beneficiary by National ID',
    description: 'Find a beneficiary using their national ID card number (CIN).',
  })
  @ApiParam({ name: 'nationalId', description: 'National ID (CIN) number', example: '12345678' })
  @ApiResponse({ status: 200, description: 'Beneficiary found' })
  @ApiResponse({ status: 404, description: 'Beneficiary not found' })
  async lookupBeneficiary(@Request() req: any, @Param('nationalId') nationalId: string) {
    if (!req.user.associationId) {
      return { error: 'No association linked' };
    }
    return this.mobileService.lookupBeneficiaryByNationalId(nationalId, req.user.associationId);
  }

  @Post('dispatch/by-national-id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Dispatch aid using National ID',
    description: 'Give aid to a beneficiary using their national ID. Deducts from budget.',
  })
  @ApiBody({ type: DispatchByNationalIdDto })
  @ApiResponse({ status: 201, description: 'Aid dispatched successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient budget or rule violation' })
  @ApiResponse({ status: 404, description: 'Beneficiary not found' })
  async dispatchByNationalId(@Request() req: any, @Body() dto: DispatchByNationalIdDto) {
    if (!req.user.associationId) {
      return { error: 'No association linked' };
    }
    return this.mobileService.dispatchByNationalId({
      nationalId: dto.nationalId,
      amount: dto.amount,
      aidType: dto.aidType,
      notes: dto.notes,
      associationId: req.user.associationId,
      processedById: req.user.id,
    });
  }

  @Post('dispatch/by-id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Dispatch aid using Beneficiary ID',
    description: 'Give aid to a beneficiary using their internal ID. Deducts from budget.',
  })
  @ApiBody({ type: DispatchByIdDto })
  @ApiResponse({ status: 201, description: 'Aid dispatched successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient budget or rule violation' })
  @ApiResponse({ status: 404, description: 'Beneficiary not found' })
  async dispatchById(@Request() req: any, @Body() dto: DispatchByIdDto) {
    if (!req.user.associationId) {
      return { error: 'No association linked' };
    }
    return this.mobileService.dispatchById({
      beneficiaryId: dto.beneficiaryId,
      amount: dto.amount,
      aidType: dto.aidType,
      notes: dto.notes,
      associationId: req.user.associationId,
      processedById: req.user.id,
    });
  }

  @Get('dispatch/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get dispatch history',
    description: 'Returns all aid dispatches made by the association.',
  })
  @ApiResponse({ status: 200, description: 'Dispatch history' })
  async getDispatchHistory(@Request() req: any) {
    if (!req.user.associationId) {
      return { error: 'No association linked' };
    }
    return this.mobileService.getDispatchHistory(req.user.associationId);
  }

  @Get('beneficiaries/eligible')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get eligible beneficiaries',
    description: 'Returns beneficiaries who can receive aid (not in cooldown).',
  })
  @ApiResponse({ status: 200, description: 'List of eligible beneficiaries' })
  async getEligibleBeneficiaries(@Request() req: any) {
    if (!req.user.associationId) {
      return { error: 'No association linked' };
    }
    return this.mobileService.getEligibleBeneficiariesForDispatch(req.user.associationId);
  }

  // ============================================================================
  // DASHBOARD / STATS
  // ============================================================================

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get dashboard statistics',
    description: 'Returns aggregated stats for the association.',
  })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  async getDashboard(@Request() req: any) {
    if (!req.user.associationId) {
      return { error: 'No association linked' };
    }
    return this.mobileService.getDashboard(req.user.associationId);
  }

  // ============================================================================
  // LEGACY ENDPOINTS (backward compatibility)
  // ============================================================================

  @Post('contribute')
  @ApiOperation({ summary: '[Legacy] Same as POST /donate' })
  async legacyContribute(@Body() dto: CreateContributionDto) {
    return this.donateAnonymous(dto);
  }

  @Post('contribute/auth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Legacy] Same as POST /donate/auth' })
  async legacyContributeAuth(@Request() req: any, @Body() dto: CreateContributionDto) {
    return this.donateAuthenticated(req, dto);
  }

  @Get('my-contributions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Legacy] Same as GET /my-donations' })
  async legacyMyContributions(@Request() req: any) {
    return this.getMyDonations(req);
  }

  @Get('dispatch/budget')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Legacy] Same as GET /budget' })
  async legacyBudget(@Request() req: any) {
    return this.getBudget(req);
  }

  @Get('dispatch/eligible')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Legacy] Same as GET /beneficiaries/eligible' })
  async legacyEligible(@Request() req: any) {
    return this.getEligibleBeneficiaries(req);
  }

  @Post('dispatch/aid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Legacy] Same as POST /dispatch/by-id' })
  async legacyDispatchAid(@Request() req: any, @Body() dto: DispatchByIdDto) {
    return this.dispatchById(req, dto);
  }
}
