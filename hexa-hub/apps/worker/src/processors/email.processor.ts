import { Job } from 'bull';
import { EmailJobPayload } from '@hexa-hub/types';
import nodemailer from 'nodemailer';
import { Logger } from '@nestjs/common';
import { env } from '../config/env';
import { renderTemplate } from '../templates/template-loader';

const logger = new Logger('EmailProcessor');

export async function processEmailJob(job: Job<EmailJobPayload>): Promise<void> {
  const { to, subject, template, context } = job.data;

  logger.log(`[email] Processing job ${job.id}: "${subject}" → ${to} (template: ${template})`);

  try {
    await job.progress(25);

    if (!env.smtp.host) {
      logger.warn('[email] SMTP_HOST is not configured. Skipping actual send (job marked complete).');
      await job.progress(100);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });

    await job.progress(50);

    // Render the HTML email from the template
    const { html, text } = renderTemplate(template, context ?? {});

    await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html,
      text,
    });

    await job.progress(90);
    logger.log(`[email] Job ${job.id} completed successfully.`);
    await job.progress(100);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`[email] Error processing job ${job.id}: ${message}`);
    throw error;
  }
}
