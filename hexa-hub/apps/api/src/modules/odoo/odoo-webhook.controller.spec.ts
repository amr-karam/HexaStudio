import { Test, TestingModule } from '@nestjs/testing';
import { OdooWebhookController } from './odoo-webhook.controller';
import { OdooWebhookService } from './odoo-webhook.service';
import { BadRequestException } from '@nestjs/common';

// ─── Mocks ──────────────────────────────────────────────────────────

const mockProcessWebhook = jest.fn().mockResolvedValue({
  processed: true,
  message: 'Webhook processed',
});

const mockTriggerSync = jest.fn().mockImplementation((model?: string) => {
  return Promise.resolve({
    synced: model ? 1 : 0,
    errors: 0,
  });
});

const mockGetSyncState = jest.fn().mockReturnValue([
  { model: 'crm.lead', status: 'active', lastSync: new Date().toISOString() },
]);

// ─── Tests ──────────────────────────────────────────────────────────

describe('OdooWebhookController', () => {
  let controller: OdooWebhookController;
  let webhookService: jest.Mocked<OdooWebhookService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OdooWebhookController],
      providers: [
        {
          provide: OdooWebhookService,
          useValue: {
            processWebhook: mockProcessWebhook,
            triggerSync: mockTriggerSync,
            getSyncState: mockGetSyncState,
          },
        },
      ],
    }).compile();

    controller = module.get<OdooWebhookController>(OdooWebhookController);
    webhookService = module.get(OdooWebhookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleWebhook', () => {
    it('should create a controller instance', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(OdooWebhookController);
    });

    it('should process a valid webhook payload', async () => {
      const payload = {
        model: 'sale.order',
        id: 1,
        action: 'create' as const,
        data: { name: 'SO-001', amount_total: 1000 },
      };

      const result = await controller.handleWebhook(payload);
      expect(webhookService.processWebhook).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ processed: true, message: 'Webhook processed' });
    });

    it('should throw BadRequestException when model is missing', async () => {
      const payload = { id: 1, action: 'create' as const, data: {} };
      await expect(controller.handleWebhook(payload as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      const payload = { model: 'sale.order', action: 'create' as const, data: {} };
      await expect(controller.handleWebhook(payload as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when action is missing', async () => {
      const payload = { model: 'sale.order', id: 1, data: {} };
      await expect(controller.handleWebhook(payload as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for an invalid action', async () => {
      const payload = {
        model: 'sale.order',
        id: 1,
        action: 'invalid' as const,
        data: {},
      };
      await expect(controller.handleWebhook(payload as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call processWebhook with the correct payload', async () => {
      const payload = {
        model: 'account.move',
        id: 42,
        action: 'update' as const,
        data: { name: 'INV-001' },
      };
      await controller.handleWebhook(payload);
      expect(webhookService.processWebhook).toHaveBeenCalledWith(payload);
    });
  });

  describe('triggerSync', () => {
    it('should trigger sync for a model', async () => {
      const result = await controller.triggerSync({ model: 'crm.lead' });
      expect(webhookService.triggerSync).toHaveBeenCalledWith('crm.lead');
      expect(result).toEqual({ synced: 1, errors: 0 });
    });

    it('should trigger sync for all models when no model is specified', async () => {
      const result = await controller.triggerSync({});
      expect(webhookService.triggerSync).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({ synced: 0, errors: 0 });
    });
  });

  describe('getSyncState', () => {
    it('should return sync state', async () => {
      const result = await controller.getSyncState();
      expect(webhookService.getSyncState).toHaveBeenCalled();
      expect(result).toEqual({ data: mockGetSyncState() });
    });
  });
});
