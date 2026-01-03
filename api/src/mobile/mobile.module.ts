import { Module } from '@nestjs/common';
import { MobileController } from './mobile.controller';
import { MobileService } from './mobile.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RulesModule } from '../rules/rules.module';
import { FamiliesModule } from '../families/families.module';

@Module({
  imports: [PrismaModule, AuthModule, RulesModule, FamiliesModule],
  controllers: [MobileController],
  providers: [MobileService],
})
export class MobileModule {}
