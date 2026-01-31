import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DispatchesService } from './dispatches.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('dispatches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DispatchesController {
  constructor(private readonly dispatchesService: DispatchesService) {}

  /**
   * Get all dispatches for an association
   */
  @Get()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  async findAll(
    @Query('associationId') associationId: string,
    @Query('status') status?: string,
  ) {
    return this.dispatchesService.findAll(associationId, status);
  }

  /**
   * Get dispatch stats for an association
   */
  @Get('stats')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  async getStats(@Query('associationId') associationId: string) {
    return this.dispatchesService.getStats(associationId);
  }

  /**
   * Get eligible beneficiaries for dispatch
   */
  @Get('eligible-beneficiaries')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  async getEligibleBeneficiaries(@Query('associationId') associationId: string) {
    return this.dispatchesService.getEligibleBeneficiaries(associationId);
  }

  /**
   * Get a specific dispatch
   */
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  async findOne(@Param('id') id: string) {
    return this.dispatchesService.findOne(id);
  }

  /**
   * Create a new dispatch (give aid to beneficiary)
   */
  @Post()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  async create(@Body() dto: CreateDispatchDto, @CurrentUser() user: any) {
    return this.dispatchesService.create(dto, user.id);
  }
}
