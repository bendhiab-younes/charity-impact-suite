import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsEmail } from 'class-validator';

// ==================== DONOR DTOs ====================

/**
 * Create a contribution (donation to association)
 * Can be used anonymously or with authentication
 */
export class CreateContributionDto {
  @ApiProperty({ description: 'Association ID to contribute to' })
  @IsString()
  @IsNotEmpty()
  associationId: string;

  @ApiProperty({ description: 'Contribution amount in TND', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Donor name (for anonymous contributions)', required: false })
  @IsString()
  @IsOptional()
  donorName?: string;

  @ApiProperty({ description: 'Donor email (for receipts)', required: false })
  @IsEmail()
  @IsOptional()
  donorEmail?: string;

  @ApiProperty({ description: 'Donation type', enum: ['ONE_TIME', 'RECURRING'], default: 'ONE_TIME', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'Payment method', enum: ['CARD', 'BANK_TRANSFER', 'CASH', 'CHECK'], default: 'CARD', required: false })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiProperty({ description: 'Optional notes or dedication', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

// ==================== ADMIN/MEMBER DTOs ====================

/**
 * Approve or reject a pending contribution
 */
export class ApproveContributionDto {
  @ApiProperty({ description: 'Contribution ID to approve/reject' })
  @IsString()
  @IsNotEmpty()
  contributionId: string;

  @ApiProperty({ description: 'Action to take', enum: ['APPROVE', 'REJECT'] })
  @IsString()
  @IsNotEmpty()
  action: 'APPROVE' | 'REJECT';

  @ApiProperty({ description: 'Reason for rejection (required if rejecting)', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * Dispatch aid to a beneficiary using their National ID
 */
export class DispatchByNationalIdDto {
  @ApiProperty({ description: 'Beneficiary National ID (CIN)', example: '12345678' })
  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @ApiProperty({ description: 'Aid amount in TND', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ 
    description: 'Type of aid', 
    enum: ['CASH', 'FOOD', 'CLOTHING', 'MEDICAL', 'EDUCATION', 'OTHER'], 
    default: 'CASH',
    required: false 
  })
  @IsString()
  @IsOptional()
  aidType?: string;

  @ApiProperty({ description: 'Notes about the dispatch', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * Dispatch aid to a beneficiary using their internal ID
 */
export class DispatchByIdDto {
  @ApiProperty({ description: 'Beneficiary ID' })
  @IsString()
  @IsNotEmpty()
  beneficiaryId: string;

  @ApiProperty({ description: 'Aid amount in TND', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ 
    description: 'Type of aid', 
    enum: ['CASH', 'FOOD', 'CLOTHING', 'MEDICAL', 'EDUCATION', 'OTHER'], 
    default: 'CASH',
    required: false 
  })
  @IsString()
  @IsOptional()
  aidType?: string;

  @ApiProperty({ description: 'Notes about the dispatch', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

// ==================== LEGACY DTOs (for backward compatibility) ====================

export class CreateMobileDonationDto extends CreateContributionDto {}
export class CreateMobileContributionDto extends CreateContributionDto {}
export class CreateMobileDispatchDto extends DispatchByIdDto {}
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
