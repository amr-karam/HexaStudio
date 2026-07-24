import { Body, Controller, HttpCode, Post, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@ApiTags('contact')
@Controller({ path: 'contact', version: ['1', VERSION_NEUTRAL] })
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  @ApiOperation({ summary: 'Submit a contact message' })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async sendMessage(@Body() dto: CreateContactDto) {
    return this.contactService.sendMessage(dto);
  }
}
