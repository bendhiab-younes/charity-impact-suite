import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum BeneficiaryStatus {
  ELIGIBLE = 'ELIGIBLE',
  INELIGIBLE = 'INELIGIBLE',
  PENDING_REVIEW = 'PENDING_REVIEW',
}

export class CreateBeneficiaryDto {
  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Ben Ali' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  associationId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  familyId: string;

  @ApiProperty({ required: false, example: '12345678', description: 'National ID (CIN)' })
  @IsString()
  @IsOptional()
  nationalId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ enum: BeneficiaryStatus, default: BeneficiaryStatus.PENDING_REVIEW })
  @IsEnum(BeneficiaryStatus)
  @IsOptional()
  status?: BeneficiaryStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  eligibilityNotes?: string;
}
