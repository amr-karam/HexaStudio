import { Injectable, Logger } from '@nestjs/common';
import { ContactMessage } from '@hexastudio/types';
import { EmailService } from '../email/email.service';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly odooService: OdooService,
  ) {}

  async sendMessage(message: ContactMessage): Promise<{ success: boolean; message: string }> {
    try {
      // Create CRM lead in Odoo
      const leadId = await this.odooService.create('crm.lead', {
        name: `Contact: ${message.name} - ${message.company || 'Unknown'}`,
        partner_name: message.company || message.name,
        email_from: message.email,
        description: `<p><strong>From:</strong> ${message.name} (${message.email})</p>
<p><strong>Company:</strong> ${message.company || 'N/A'}</p>
<p><strong>Message:</strong></p><p>${message.message}</p>`,
      });
      this.logger.log(`Created Odoo CRM lead #${leadId} for ${message.email}`);

      // Try to send email notification (non-blocking)
      try {
        await this.emailService.sendEmail(
          'info@hexastudio.net',
          `New Contact Request from ${message.name}`,
          `From: ${message.email}\nCompany: ${message.company}\nMessage: ${message.message}`
        );
      } catch (emailError) {
        this.logger.warn(`Email notification failed (non-critical): ${emailError}`);
      }
      
      return {
        success: true,
        message: 'Thank you for your message. We will get back to you within 24 hours.',
      };
    } catch (error) {
      this.logger.error(`Failed to process contact form: ${error}`);
      return {
        success: false,
        message: 'Our system is currently unavailable. Please try again later.',
      };
    }
  }
}
