import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';

export enum AssociationStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export class CreateAssociationDto {
  @ApiProperty({ example: 'Hope Foundation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Helping families in need' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'contact@hope.org' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ enum: AssociationStatus, default: AssociationStatus.PENDING })
  @IsEnum(AssociationStatus)
  @IsOptional()
  status?: AssociationStatus;
}
