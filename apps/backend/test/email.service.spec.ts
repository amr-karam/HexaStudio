import './setup';
import { EmailService } from '../src/modules/email/email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(() => {
    service = new EmailService();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sendEmail resolves to true after the simulated delay', async () => {
    const promise = service.sendEmail('to@example.com', 'Subject', 'Body');

    await vi.advanceTimersByTimeAsync(500);

    await expect(promise).resolves.toBe(true);
  });
});
