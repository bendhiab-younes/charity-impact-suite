import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AssociationsModule } from './associations/associations.module';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { FamiliesModule } from './families/families.module';
import { DonationsModule } from './donations/donations.module';
import { RulesModule } from './rules/rules.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AssociationsModule,
    BeneficiariesModule,
    FamiliesModule,
    DonationsModule,
    RulesModule,
  ],
})
export class AppModule {}
