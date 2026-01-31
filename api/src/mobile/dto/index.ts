import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsEmail } from 'class-validator';

export class CreateMobileDonationDto {
  @ApiProperty({ description: 'Association ID to donate to' })
  @IsString()
  @IsNotEmpty()
  associationId: string;

  @ApiProperty({ description: 'Donation amount', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Donation type', enum: ['ONE_TIME', 'RECURRING'], required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'Payment method', enum: ['CARD', 'BANK_TRANSFER', 'CASH'], required: false })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiProperty({ description: 'Optional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class DispatchDonationDto {
  @ApiProperty({ description: 'Donation ID to dispatch' })
  @IsString()
  @IsNotEmpty()
  donationId: string;

  @ApiProperty({ description: 'Beneficiary ID to receive the donation' })
  @IsString()
  @IsNotEmpty()
  beneficiaryId: string;
}

// NEW: Contribution DTO (money coming IN from donors)
export class CreateMobileContributionDto {
  @ApiProperty({ description: 'Association ID to contribute to' })
  @IsString()
  @IsNotEmpty()
  associationId: string;

  @ApiProperty({ description: 'Contribution amount', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Donor name (for anonymous contributions)', required: false })
  @IsString()
  @IsOptional()
  donorName?: string;

  @ApiProperty({ description: 'Donor email (for anonymous contributions)', required: false })
  @IsEmail()
  @IsOptional()
  donorEmail?: string;

  @ApiProperty({ description: 'Contribution type', enum: ['ONE_TIME', 'RECURRING'], required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'Payment method', enum: ['CARD', 'BANK_TRANSFER', 'CASH', 'CHECK'], required: false })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiProperty({ description: 'Optional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

// NEW: Dispatch DTO (aid going OUT to beneficiaries)
export class CreateMobileDispatchDto {
  @ApiProperty({ description: 'Beneficiary ID to receive aid' })
  @IsString()
  @IsNotEmpty()
  beneficiaryId: string;

  @ApiProperty({ description: 'Aid amount', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Type of aid', enum: ['CASH', 'FOOD', 'CLOTHING', 'MEDICAL', 'EDUCATION', 'OTHER'], required: false })
  @IsString()
  @IsOptional()
  aidType?: string;

  @ApiProperty({ description: 'Family ID (optional, auto-resolved from beneficiary)', required: false })
  @IsString()
  @IsOptional()
  familyId?: string;

  @ApiProperty({ description: 'Optional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
