import { Module } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { FamiliesModule } from '../families/families.module';
import { RulesModule } from '../rules/rules.module';

@Module({
  imports: [FamiliesModule, RulesModule],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}
