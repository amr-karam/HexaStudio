import { Injectable } from '@nestjs/common';
import { ContactMessage } from '@hexastudio/types';
import { EmailService } from '../email/email.service';

@Injectable()
export class ContactService {
  constructor(private readonly emailService: EmailService) {}

  async sendMessage(message: ContactMessage): Promise<{ success: boolean; message: string }> {
    try {
      await this.emailService.sendEmail(
        'info@hexastudio.net',
        `New Contact Request from ${message.name}`,
        `From: ${message.email}\nCompany: ${message.company}\nMessage: ${message.message}`
      );
      
      return {
        success: true,
        message: 'Thank you for your message. We will get back to you within 24 hours.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Our email system is currently unavailable. Please try again later.',
      };
    }
  }
}
