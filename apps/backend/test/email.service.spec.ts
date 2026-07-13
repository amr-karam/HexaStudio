import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../src/modules/email/email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('sends email and returns true', async () => {
    const result = await service.sendEmail(
      'recipient@example.com',
      'Test Subject',
      'Test body content',
    );
    expect(result).toBe(true);
  });

  it('sends email to any address format', async () => {
    const result = await service.sendEmail('admin@hexastudio.net', 'Alert', 'System alert');
    expect(result).toBe(true);
  });

  it('handles empty body gracefully', async () => {
    const result = await service.sendEmail('user@example.com', 'No body', '');
    expect(result).toBe(true);
  });
});
