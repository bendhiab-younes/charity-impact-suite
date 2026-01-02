import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';

export enum RuleType {
  FREQUENCY = 'FREQUENCY',
  AMOUNT = 'AMOUNT',
  ELIGIBILITY = 'ELIGIBILITY',
}

export class CreateRuleDto {
  @ApiProperty({ example: 'Cooldown Period' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Minimum days between donations to the same family' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  associationId: string;

  @ApiProperty({ enum: RuleType })
  @IsEnum(RuleType)
  type: RuleType;

  @ApiProperty({ example: 30 })
  @IsNumber()
  value: number;

  @ApiProperty({ required: false, example: 'days' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
