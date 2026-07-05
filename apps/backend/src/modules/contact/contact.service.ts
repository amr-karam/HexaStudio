import { Injectable } from '@nestjs/common';
import { ContactMessage } from '@hexastudio/types';

@Injectable()
export class ContactService {
  async sendMessage(message: ContactMessage): Promise<{ success: boolean; message: string }> {
    // TODO: Integrate with email service (SendGrid, SES, etc.)
    // For now, log and return success
    console.log('Contact message received:', message);
    return {
      success: true,
      message: 'Thank you for your message. We will get back to you within 24 hours.',
    };
  }
}
