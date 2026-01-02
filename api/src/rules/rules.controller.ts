import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Rules')
@Controller('rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RulesController {
  constructor(private rulesService: RulesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'ASSOCIATION_MEMBER')
  @ApiOperation({ summary: 'Get all rules for an association' })
  async findByAssociation(@Query('associationId') associationId: string) {
    return this.rulesService.findByAssociation(associationId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Get rule by ID' })
  async findOne(@Param('id') id: string) {
    return this.rulesService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Create a new rule' })
  async create(@Body() dto: CreateRuleDto) {
    return this.rulesService.create(dto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Update a rule' })
  async update(@Param('id') id: string, @Body() dto: UpdateRuleDto) {
    return this.rulesService.update(id, dto);
  }

  @Patch(':id/toggle')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Toggle rule active status' })
  async toggleActive(@Param('id') id: string) {
    return this.rulesService.toggleActive(id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  @ApiOperation({ summary: 'Delete a rule' })
  async remove(@Param('id') id: string) {
    return this.rulesService.delete(id);
  }
}
