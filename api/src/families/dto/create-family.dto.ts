import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum FamilyStatus {
  ELIGIBLE = 'ELIGIBLE',
  INELIGIBLE = 'INELIGIBLE',
  COOLDOWN = 'COOLDOWN',
}

export class CreateFamilyDto {
  @ApiProperty({ example: 'Ben Ali Family' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  associationId: string;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @IsOptional()
  memberCount?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ enum: FamilyStatus, default: FamilyStatus.ELIGIBLE })
  @IsEnum(FamilyStatus)
  @IsOptional()
  status?: FamilyStatus;
}
