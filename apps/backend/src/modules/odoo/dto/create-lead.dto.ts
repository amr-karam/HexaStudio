import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { HexaLeadSource, HexaLeadService, HexaLeadBudget } from '@hexastudio/types';

export class CreateLeadDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contact_name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  partner_name?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email_from?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  stage_id?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ enum: ['website', 'referral', 'direct'] })
  @IsEnum(['website', 'referral', 'direct'])
  @IsOptional()
  x_hexa_source?: HexaLeadSource;

  @ApiPropertyOptional({ enum: ['residential', 'commercial', 'interior'] })
  @IsEnum(['residential', 'commercial', 'interior'])
  @IsOptional()
  x_hexa_service?: HexaLeadService;

  @ApiPropertyOptional({ enum: ['under_50k', '50k_100k', '100k_500k', '500k_plus'] })
  @IsEnum(['under_50k', '50k_100k', '100k_500k', '500k_plus'])
  @IsOptional()
  x_hexa_budget?: HexaLeadBudget;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  x_hexa_referral_code?: string;
}
