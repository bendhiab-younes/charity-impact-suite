import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

/**
 * DTO for creating a donation (aid OUT to beneficiaries)
 */
export class CreateDonationDto {
  @ApiProperty({ example: 100, description: 'Amount to give to the beneficiary' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Association ID' })
  @IsString()
  @IsNotEmpty()
  associationId: string;

  @ApiProperty({ description: 'Beneficiary receiving the donation' })
  @IsString()
  @IsNotEmpty()
  beneficiaryId: string;

  @ApiProperty({ required: false, description: 'Family ID (auto-resolved from beneficiary if not provided)' })
  @IsString()
  @IsOptional()
  familyId?: string;

  @ApiProperty({ default: 'TND', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ 
    default: 'CASH', 
    required: false,
    description: 'Type of aid: CASH, FOOD, CLOTHING, MEDICAL, EDUCATION, OTHER'
  })
  @IsString()
  @IsOptional()
  aidType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
