import './setup';
import { ContactService } from '../src/modules/contact/contact.service';

describe('ContactService', () => {
  let service: ContactService;

  beforeAll(() => {
    const mockOdooService = { create: vi.fn().mockResolvedValue(1) };
    service = new ContactService(mockOdooService as any);
  });

  it('sendMessage returns success for valid message', async () => {
    const result = await service.sendMessage({
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message',
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Thank you');
  });

  it('sendMessage accepts optional company field', async () => {
    const result = await service.sendMessage({
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Corp',
      message: 'Message with company',
    });

    expect(result.success).toBe(true);
  });
});
