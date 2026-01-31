import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Get audit logs for an association' })
  async findAll(
    @Query('associationId') associationId: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    // Association admins can only see their own association's logs
    const effectiveAssociationId = 
      req.user.role === 'ASSOCIATION_ADMIN' 
        ? req.user.associationId 
        : associationId;

    if (!effectiveAssociationId) {
      return [];
    }

    return this.auditService.findAll(
      effectiveAssociationId,
      limit ? parseInt(limit) : undefined,
    );
  }
}
