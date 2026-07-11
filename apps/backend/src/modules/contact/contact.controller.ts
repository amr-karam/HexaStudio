import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ContactService } from './contact.service';

class ContactMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message!: string;
}

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Submit a contact message' })
  @ApiBody({ type: ContactMessageDto })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async sendMessage(@Body() message: ContactMessageDto) {
    return this.contactService.sendMessage(message);
  }
}
