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
  @ApiResponse({ 
    status: 200, 
    description: 'List of active associations',
    schema: {
      example: [
        {
          id: 'cml30zlfz00009my9g44vlrdo',
          name: 'Espoir Tunisie',
          description: 'Supporting families in need across Tunisia',
          email: 'contact@espoir-tunisie.org',
          phone: '+216 71 234 567',
          address: 'Tunis, Tunisia',
          budget: 35657.96,
          totalRaised: 37681.96,
          totalDistributed: 2024.00,
          totalBeneficiaries: 6,
          totalFamilies: 4,
          successRate: 89
        }
      ]
    }
  })
  async getAssociations() {
    return this.mobileService.getPublicAssociations();
  }

  @Get('associations/:id')
  @ApiOperation({ 
    summary: 'Get association details',
    description: 'Returns detailed info about an association including donation stats.',
  })
  @ApiParam({ name: 'id', description: 'Association ID', example: 'cml30zlfz00009my9g44vlrdo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Association details',
    schema: {
      example: {
        id: 'cml30zlfz00009my9g44vlrdo',
        name: 'Espoir Tunisie',
        description: 'Supporting families in need across Tunisia',
        email: 'contact@espoir-tunisie.org',
        phone: '+216 71 234 567',
        address: 'Tunis, Tunisia',
        budget: 35657.96,
        totalRaised: 37681.96,
        totalDistributed: 2024.00,
        totalBeneficiaries: 6,
        totalFamilies: 4,
        totalMembers: 3,
        successRate: 89,
        recentDonations: [
          {
            id: 'donation123',
            amount: 250,
            beneficiaryName: 'Fatma Ben Ahmed',
            createdAt: '2026-02-10T10:30:00Z'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Association not found' })
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
  @ApiBody({ 
    type: CreateContributionDto,
    examples: {
      anonymous: {
        summary: 'Anonymous donation',
        value: {
          associationId: 'cml30zlfz00009my9g44vlrdo',
          amount: 250,
          donorName: 'Ahmed Ben Ali',
          donorEmail: 'ahmed.benali@email.com',
          type: 'ONE_TIME',
          method: 'CARD',
          notes: 'In memory of my grandmother'
        }
      },
      minimal: {
        summary: 'Minimal donation',
        value: {
          associationId: 'cml30zlfz00009my9g44vlrdo',
          amount: 100
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Donation created, pending approval',
    schema: {
      example: {
        id: 'cm15abc7g00003def3456klmn',
        associationId: 'cml30zlfz00009my9g44vlrdo',
        amount: 250,
        status: 'PENDING',
        donorName: 'Ahmed Ben Ali',
        donorEmail: 'ahmed.benali@email.com',
        type: 'ONE_TIME',
        method: 'CARD',
        notes: 'In memory of my grandmother',
        createdAt: '2026-02-15T02:25:00Z'
      }
    }
  })
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
  @ApiBody({ 
    type: CreateContributionDto,
    examples: {
      authenticated: {
        summary: 'Authenticated donation',
        value: {
          associationId: 'cml30zlfz00009my9g44vlrdo',
          amount: 500,
          type: 'ONE_TIME',
          method: 'BANK_TRANSFER',
          notes: 'Monthly donation for education programs'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Donation created',
    schema: {
      example: {
        id: 'cm15abc7g00003def3456klmn',
        associationId: 'cml30zlfz00009my9g44vlrdo',
        donorId: 'user123',
        amount: 500,
        status: 'PENDING',
        type: 'ONE_TIME',
        method: 'BANK_TRANSFER',
        notes: 'Monthly donation for education programs',
        createdAt: '2026-02-15T02:25:00Z'
      }
    }
  })
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
  @ApiResponse({ 
    status: 200, 
    description: 'Donation history',
    schema: {
      example: [
        {
          id: 'cm15abc7g00003def3456klmn',
          associationId: 'cml30zlfz00009my9g44vlrdo',
          associationName: 'Espoir Tunisie',
          amount: 500,
          status: 'APPROVED',
          type: 'ONE_TIME',
          method: 'BANK_TRANSFER',
          notes: 'Monthly donation for education programs',
          createdAt: '2026-02-15T02:25:00Z',
          updatedAt: '2026-02-15T10:30:00Z'
        },
        {
          id: 'cm14xyz6f00002abc9012ghij',
          associationId: 'cml30zlfz00009my9g44vlrdo',
          associationName: 'Espoir Tunisie',
          amount: 250,
          status: 'APPROVED',
          type: 'ONE_TIME',
          method: 'CARD',
          createdAt: '2026-01-20T14:15:00Z',
          updatedAt: '2026-01-20T15:00:00Z'
        }
      ]
    }
  })
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
  @ApiResponse({ 
    status: 200, 
    description: 'List of pending contributions',
    schema: {
      example: [
        {
          id: 'cm15abc7g00003def3456klmn',
          associationId: 'cml30zlfz00009my9g44vlrdo',
          amount: 350,
          status: 'PENDING',
          donorName: 'Ahmed Ben Ali',
          donorEmail: 'ahmed.benali@email.com',
          type: 'ONE_TIME',
          method: 'CARD',
          notes: 'In memory of my grandmother',
          createdAt: '2026-02-15T02:25:00Z'
        }
      ]
    }
  })
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
  @ApiBody({ 
    type: ApproveContributionDto,
    examples: {
      approve: {
        summary: 'Approve contribution',
        value: {
          contributionId: 'cm15abc7g00003def3456klmn',
          action: 'APPROVE'
        }
      },
      reject: {
        summary: 'Reject contribution',
        value: {
          contributionId: 'cm15abc7g00003def3456klmn',
          action: 'REJECT',
          reason: 'Payment verification failed'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Contribution updated',
    schema: {
      example: {
        id: 'cm15abc7g00003def3456klmn',
        associationId: 'cml30zlfz00009my9g44vlrdo',
        amount: 350,
        status: 'APPROVED',
        donorName: 'Ahmed Ben Ali',
        donorEmail: 'ahmed.benali@email.com',
        approvedById: 'admin123',
        approvedAt: '2026-02-15T10:30:00Z',
        updatedAt: '2026-02-15T10:30:00Z'
      }
    }
  })
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
  @ApiResponse({ 
    status: 200, 
    description: 'Budget information',
    schema: {
      example: {
        associationId: 'cml30zlfz00009my9g44vlrdo',
        associationName: 'Espoir Tunisie',
        budget: 35657.96,
        currency: 'TND'
      }
    }
  })
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
  @ApiResponse({ 
    status: 200, 
    description: 'Beneficiary found',
    schema: {
      example: {
        id: 'cm13xyz5e00001abc5678defg',
        cin: '12345678',
        firstName: 'Fatma',
        lastName: 'Ben Ahmed',
        dateOfBirth: '1985-03-15T00:00:00Z',
        address: 'Rue de la République, Tunis',
        phone: '+216 98 765 432',
        status: 'ELIGIBLE',
        familyId: 'family123',
        family: {
          id: 'family123',
          name: 'Ben Ahmed Family',
          size: 5,
          monthlyIncome: 800,
          lastDonationDate: '2026-01-10T00:00:00Z'
        },
        canReceiveAid: true,
        cooldownDaysRemaining: 0
      }
    }
  })
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
  @ApiBody({ 
    type: DispatchByNationalIdDto,
    examples: {
      foodPackage: {
        summary: 'Food package dispatch',
        value: {
          nationalId: '12345678',
          amount: 150,
          aidType: 'FOOD',
          notes: 'Food package for Ramadan'
        }
      },
      cashAssistance: {
        summary: 'Cash assistance',
        value: {
          nationalId: '12345678',
          amount: 300,
          aidType: 'CASH',
          notes: 'Monthly rent assistance'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Aid dispatched successfully',
    schema: {
      example: {
        id: 'donation456',
        beneficiaryId: 'cm13xyz5e00001abc5678defg',
        familyId: 'family123',
        associationId: 'cml30zlfz00009my9g44vlrdo',
        amount: 150,
        status: 'COMPLETED',
        aidType: 'FOOD',
        notes: 'Food package for Ramadan',
        dispatchedBy: 'member123',
        createdAt: '2026-02-15T11:00:00Z',
        beneficiary: {
          firstName: 'Fatma',
          lastName: 'Ben Ahmed',
          cin: '12345678'
        },
        remainingBudget: 35507.96
      }
    }
  })
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
  @ApiBody({ 
    type: DispatchByIdDto,
    examples: {
      medicalSupplies: {
        summary: 'Medical supplies dispatch',
        value: {
          beneficiaryId: 'cm13xyz5e00001abc5678defg',
          amount: 200,
          aidType: 'MEDICAL',
          notes: 'Medical supplies for diabetes treatment'
        }
      },
      education: {
        summary: 'Education support',
        value: {
          beneficiaryId: 'cm13xyz5e00001abc5678defg',
          amount: 180,
          aidType: 'EDUCATION',
          notes: 'School supplies and books'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Aid dispatched successfully',
    schema: {
      example: {
        id: 'donation789',
        beneficiaryId: 'cm13xyz5e00001abc5678defg',
        familyId: 'family123',
        associationId: 'cml30zlfz00009my9g44vlrdo',
        amount: 200,
        status: 'COMPLETED',
        aidType: 'MEDICAL',
        notes: 'Medical supplies for diabetes treatment',
        dispatchedBy: 'member123',
        createdAt: '2026-02-15T11:15:00Z',
        beneficiary: {
          firstName: 'Fatma',
          lastName: 'Ben Ahmed',
          cin: '12345678'
        },
        remainingBudget: 35457.96
      }
    }
  })
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
  @ApiResponse({ 
    status: 200, 
    description: 'Dispatch history',
    schema: {
      example: [
        {
          id: 'donation789',
          beneficiaryId: 'cm13xyz5e00001abc5678defg',
          familyId: 'family123',
          associationId: 'cml30zlfz00009my9g44vlrdo',
          amount: 200,
          status: 'COMPLETED',
          aidType: 'MEDICAL',
          notes: 'Medical supplies for diabetes treatment',
          dispatchedBy: 'member123',
          createdAt: '2026-02-15T11:15:00Z',
          beneficiary: {
            firstName: 'Fatma',
            lastName: 'Ben Ahmed',
            cin: '12345678'
          }
        },
        {
          id: 'donation456',
          beneficiaryId: 'beneficiary789',
          familyId: 'family456',
          associationId: 'cml30zlfz00009my9g44vlrdo',
          amount: 150,
          status: 'COMPLETED',
          aidType: 'FOOD',
          notes: 'Food package for Ramadan',
          dispatchedBy: 'admin123',
          createdAt: '2026-02-10T09:30:00Z',
          beneficiary: {
            firstName: 'Mohamed',
            lastName: 'Ben Salem',
            cin: '87654321'
          }
        }
      ]
    }
  })
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
  @ApiResponse({ 
    status: 200, 
    description: 'List of eligible beneficiaries',
    schema: {
      example: [
        {
          id: 'cm13xyz5e00001abc5678defg',
          cin: '12345678',
          firstName: 'Fatma',
          lastName: 'Ben Ahmed',
          dateOfBirth: '1985-03-15T00:00:00Z',
          address: 'Rue de la République, Tunis',
          phone: '+216 98 765 432',
          status: 'ELIGIBLE',
          familyId: 'family123',
          family: {
            id: 'family123',
            name: 'Ben Ahmed Family',
            size: 5,
            monthlyIncome: 800,
            lastDonationDate: '2026-01-10T00:00:00Z'
          },
          canReceiveAid: true,
          cooldownDaysRemaining: 0
        },
        {
          id: 'beneficiary789',
          cin: '87654321',
          firstName: 'Mohamed',
          lastName: 'Ben Salem',
          dateOfBirth: '1978-11-22T00:00:00Z',
          address: 'Avenue Habib Bourguiba, Sfax',
          phone: '+216 97 123 456',
          status: 'ELIGIBLE',
          familyId: 'family456',
          family: {
            id: 'family456',
            name: 'Ben Salem Family',
            size: 4,
            monthlyIncome: 600,
            lastDonationDate: '2025-12-20T00:00:00Z'
          },
          canReceiveAid: true,
          cooldownDaysRemaining: 0
        }
      ]
    }
  })
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
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard stats',
    schema: {
      example: {
        associationId: 'cml30zlfz00009my9g44vlrdo',
        associationName: 'Espoir Tunisie',
        budget: 35657.96,
        contributions: {
          pending: {
            count: 2,
            amount: 650
          },
          approved: {
            count: 11,
            amount: 37681.96
          },
          rejected: {
            count: 0,
            amount: 0
          }
        },
        dispatches: {
          totalAmount: 2024.00,
          totalCount: 9,
          thisMonth: {
            amount: 550,
            count: 3
          }
        },
        beneficiaries: {
          total: 6,
          eligible: 4,
          inCooldown: 2
        },
        families: {
          total: 4,
          activeThisMonth: 3
        }
      }
    }
  })
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
