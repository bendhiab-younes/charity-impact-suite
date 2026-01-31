import { Module } from '@nestjs/common';
import { DispatchesService } from './dispatches.service';
import { DispatchesController } from './dispatches.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FamiliesModule } from '../families/families.module';
import { RulesModule } from '../rules/rules.module';

@Module({
  imports: [PrismaModule, FamiliesModule, RulesModule],
  controllers: [DispatchesController],
  providers: [DispatchesService],
  exports: [DispatchesService],
})
export class DispatchesModule {}
