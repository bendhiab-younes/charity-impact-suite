import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateContributionDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'TND';

  @IsString()
  associationId: string;

  @IsString()
  @IsOptional()
  donorId?: string;

  @IsString()
  @IsOptional()
  donorName?: string;

  @IsString()
  @IsOptional()
  donorEmail?: string;

  @IsString()
  @IsOptional()
  type?: string = 'ONE_TIME';

  @IsString()
  @IsOptional()
  method?: string = 'CARD';

  @IsString()
  @IsOptional()
  notes?: string;
}
