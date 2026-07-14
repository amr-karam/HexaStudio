import { Job } from 'bull';
import { EmailJobPayload } from '@hexa-hub/types';
import nodemailer from 'nodemailer';
import { Logger } from '@nestjs/common';
import { env } from '../config/env';

const logger = new Logger('EmailProcessor');

function renderTemplate(template: string, context: Record<string, unknown> = {}): string {
  const rows = Object.entries(context)
    .map(([key, value]) => `<li><strong>${key}</strong>: ${String(value)}</li>`)
    .join('');

  return [
    '<div style="font-family: Arial, sans-serif; color: #1a1a1a;">',
    `<h2>${template}</h2>`,
    rows ? `<ul>${rows}</ul>` : '<p>You have a new notification.</p>',
    '</div>',
  ].join('\n');
}

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

    await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html: renderTemplate(template, context),
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
