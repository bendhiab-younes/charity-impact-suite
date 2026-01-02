import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

export enum DonationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum DonationType {
  ONE_TIME = 'ONE_TIME',
  RECURRING = 'RECURRING',
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHECK = 'CHECK',
}

export class CreateDonationDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  associationId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  donorId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  beneficiaryId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  familyId?: string;

  @ApiProperty({ default: 'TND' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ enum: DonationType, default: DonationType.ONE_TIME })
  @IsEnum(DonationType)
  @IsOptional()
  type?: DonationType;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
