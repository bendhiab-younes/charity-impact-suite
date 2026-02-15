import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsEmail } from 'class-validator';

// ==================== DONOR DTOs ====================

/**
 * Create a contribution (donation to association)
 * Can be used anonymously or with authentication
 */
export class CreateContributionDto {
  @ApiProperty({ 
    description: 'Association ID to contribute to',
    example: 'cml30zlfz00009my9g44vlrdo'
  })
  @IsString()
  @IsNotEmpty()
  associationId: string;

  @ApiProperty({ 
    description: 'Contribution amount in TND', 
    example: 250,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ 
    description: 'Donor name (for anonymous contributions)', 
    required: false,
    example: 'Ahmed Ben Ali'
  })
  @IsString()
  @IsOptional()
  donorName?: string;

  @ApiProperty({ 
    description: 'Donor email (for receipts)', 
    required: false,
    example: 'ahmed.benali@email.com'
  })
  @IsEmail()
  @IsOptional()
  donorEmail?: string;

  @ApiProperty({ 
    description: 'Donation type', 
    enum: ['ONE_TIME', 'RECURRING'], 
    default: 'ONE_TIME', 
    required: false,
    example: 'ONE_TIME'
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ 
    description: 'Payment method', 
    enum: ['CARD', 'BANK_TRANSFER', 'CASH', 'CHECK'], 
    default: 'CARD', 
    required: false,
    example: 'CARD'
  })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiProperty({ 
    description: 'Optional notes or dedication', 
    required: false,
    example: 'In memory of my grandmother'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

// ==================== ADMIN/MEMBER DTOs ====================

/**
 * Approve or reject a pending contribution
 */
export class ApproveContributionDto {
  @ApiProperty({ 
    description: 'Contribution ID to approve/reject',
    example: 'cm12abc3d00009xyz1234abcd'
  })
  @IsString()
  @IsNotEmpty()
  contributionId: string;

  @ApiProperty({ 
    description: 'Action to take', 
    enum: ['APPROVE', 'REJECT'],
    example: 'APPROVE'
  })
  @IsString()
  @IsNotEmpty()
  action: 'APPROVE' | 'REJECT';

  @ApiProperty({ 
    description: 'Reason for rejection (required if rejecting)', 
    required: false,
    example: 'Payment verification failed'
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * Dispatch aid to a beneficiary using their National ID
 */
export class DispatchByNationalIdDto {
  @ApiProperty({ 
    description: 'Beneficiary National ID (CIN)', 
    example: '12345678'
  })
  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @ApiProperty({ 
    description: 'Aid amount in TND', 
    example: 150,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ 
    description: 'Type of aid', 
    enum: ['CASH', 'FOOD', 'CLOTHING', 'MEDICAL', 'EDUCATION', 'OTHER'], 
    default: 'CASH',
    required: false,
    example: 'FOOD'
  })
  @IsString()
  @IsOptional()
  aidType?: string;

  @ApiProperty({ 
    description: 'Notes about the dispatch', 
    required: false,
    example: 'Food package for Ramadan'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * Dispatch aid to a beneficiary using their internal ID
 */
export class DispatchByIdDto {
  @ApiProperty({ 
    description: 'Beneficiary ID',
    example: 'cm13xyz5e00001abc5678defg'
  })
  @IsString()
  @IsNotEmpty()
  beneficiaryId: string;

  @ApiProperty({ 
    description: 'Aid amount in TND', 
    example: 200,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ 
    description: 'Type of aid', 
    enum: ['CASH', 'FOOD', 'CLOTHING', 'MEDICAL', 'EDUCATION', 'OTHER'], 
    default: 'CASH',
    required: false,
    example: 'MEDICAL'
  })
  @IsString()
  @IsOptional()
  aidType?: string;

  @ApiProperty({ 
    description: 'Notes about the dispatch', 
    required: false,
    example: 'Medical supplies for diabetes treatment'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

// ==================== LEGACY DTOs (for backward compatibility) ====================

export class CreateMobileDonationDto extends CreateContributionDto {}
export class CreateMobileContributionDto extends CreateContributionDto {}
export class CreateMobileDispatchDto extends DispatchByIdDto {}
export class DispatchDonationDto {
  @ApiProperty({ 
    description: 'Donation ID to dispatch',
    example: 'cm14xyz6f00002abc9012ghij'
  })
  @IsString()
  @IsNotEmpty()
  donationId: string;

  @ApiProperty({ 
    description: 'Beneficiary ID to receive the donation',
    example: 'cm13xyz5e00001abc5678defg'
  })
  @IsString()
  @IsNotEmpty()
  beneficiaryId: string;
}
