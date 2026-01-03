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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get all active associations for public browsing' })
  async getPublicAssociations() {
    return this.mobileService.getPublicAssociations();
  }

  @Get('associations/:id')
  @ApiOperation({ summary: 'Get association details by ID' })
  async getAssociationDetails(@Param('id') id: string) {
    return this.mobileService.getAssociationDetails(id);
  }

  // ==================== DONOR ENDPOINTS ====================

  @Post('donate')
  @ApiOperation({ summary: 'Create a donation (anonymous - no auth required)' })
  @ApiBody({ type: CreateMobileDonationDto })
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
  @ApiOperation({ summary: 'Create a donation (authenticated donor)' })
  @ApiBody({ type: CreateMobileDonationDto })
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
  @ApiOperation({ summary: 'Get donation history for authenticated donor' })
  async getDonorHistory(@Request() req: any) {
    return this.mobileService.getDonorHistory(req.user.id);
  }

  // ==================== ASSOCIATION MEMBER/ADMIN ENDPOINTS ====================

  @Get('dispatch/beneficiaries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get eligible beneficiaries for dispatch' })
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
  @ApiOperation({ summary: 'Get pending/approved donations to dispatch' })
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
  @ApiOperation({ summary: 'Dispatch a donation to a beneficiary' })
  @ApiBody({ type: DispatchDonationDto })
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
  @ApiOperation({ summary: 'Get association dashboard stats for mobile' })
  async getAssociationDashboard(@Request() req: any) {
    if (!req.user.associationId) {
      return { error: 'No association linked to your account' };
    }
    return this.mobileService.getAssociationDashboard(req.user.associationId);
  }
}
