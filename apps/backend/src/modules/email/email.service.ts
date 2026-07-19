import { Injectable, Logger } from '@nestjs/common';

/**
 * Email delivery abstraction.
 *
 * Currently a simulated/placeholder implementation that resolves after a short
 * delay. Replace with a real provider (SendGrid, AWS SES, Postmark, etc.) in
 * production.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    this.logger.debug(`Sending email to ${to} - ${subject} (${body.length} chars)`);
    // Simulate network latency of a real email provider.
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.logger.log(`Email sent to ${to}`);
    return true;
  }
}
