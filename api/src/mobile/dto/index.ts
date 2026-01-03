import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

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
