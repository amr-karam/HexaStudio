import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    this.logger.log(`Sending email to: ${to}`);
    this.logger.log(`Subject: ${subject}`);
    this.logger.log(`Body: ${body}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.logger.log(`Email sent successfully to ${to}`);
    return true;
  }
}
