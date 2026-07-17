import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the sender' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address of the sender' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: 'Acme Corp', description: 'Company name (optional)' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number (optional)' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'residential', description: 'Service type: residential, commercial, or interior' })
  @IsOptional()
  @IsIn(['residential', 'commercial', 'interior'])
  service?: 'residential' | 'commercial' | 'interior';

  @ApiPropertyOptional({ example: '100k_500k', description: 'Budget range: under_50k, 50k_100k, 100k_500k, 500k_plus' })
  @IsOptional()
  @IsIn(['under_50k', '50k_100k', '100k_500k', '500k_plus'])
  budget?: 'under_50k' | '50k_100k' | '100k_500k' | '500k_plus';

  @ApiProperty({ example: 'I would like to discuss a project...', description: 'Message content' })
  @IsString()
  message!: string;
}