import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateDispatchDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'TND';

  @IsString()
  associationId: string;

  @IsString()
  beneficiaryId: string;

  @IsString()
  @IsOptional()
  familyId?: string;

  @IsString()
  @IsOptional()
  aidType?: string = 'CASH';

  @IsString()
  @IsOptional()
  notes?: string;
}
