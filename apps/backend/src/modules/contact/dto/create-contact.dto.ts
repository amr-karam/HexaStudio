import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

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

  @ApiProperty({ example: 'I would like to discuss a project...', description: 'Message content' })
  @IsString()
  message!: string;
}