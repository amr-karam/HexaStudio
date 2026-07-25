import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { StrapiWebhookController } from '../src/modules/odoo/strapi-webhook.controller';
import { StrapiProjectSyncService } from '../src/modules/odoo/strapi-project-sync.service';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockStrapiProjectSyncService = {
  syncPortfolioToOdoo: vi.fn().mockResolvedValue(100),
  isSynced: vi.fn().mockResolvedValue(false),
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('StrapiWebhookController', () => {
  let controller: StrapiWebhookController;

  beforeAll(async () => {
    // Must set secret before module compilation so getEnv() finds it
    process.env.STRAPI_WEBHOOK_SECRET = 'test-strapi-secret-at-least-32-chars-long!!';
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StrapiWebhookController],
      providers: [
        { provide: StrapiProjectSyncService, useValue: mockStrapiProjectSyncService },
      ],
    }).compile();

    controller = module.get<StrapiWebhookController>(StrapiWebhookController);
  });

  // ── Webhook signature validation ────────────────────────────────────

  describe('signature validation', () => {
    it('accepts a valid x-strapi-secret header', async () => {
      const payload = {
        event: 'entry.create',
        model: 'portfolio',
        entry: { slug: 'seaside-villa', title: 'Seaside Villa' },
      };

      const result = await controller.handleWebhook(
        'test-strapi-secret-at-least-32-chars-long!!',
        payload,
      );

      expect(result.success).toBe(true);
      expect(mockStrapiProjectSyncService.syncPortfolioToOdoo).toHaveBeenCalledWith('seaside-villa');
    });

    it('rejects an invalid x-strapi-secret header', async () => {
      const payload = {
        event: 'entry.create',
        model: 'portfolio',
        entry: { slug: 'seaside-villa' },
      };

      await expect(
        controller.handleWebhook('wrong-secret', payload),
      ).rejects.toThrow('Invalid webhook secret');

      expect(mockStrapiProjectSyncService.syncPortfolioToOdoo).not.toHaveBeenCalled();
    });
  });

  // ── Event routing ───────────────────────────────────────────────────

  describe('event routing', () => {
    it('calls syncPortfolioToOdoo on entry.create', async () => {
      const result = await controller.handleWebhook(
        'test-strapi-secret-at-least-32-chars-long!!',
        { event: 'entry.create', model: 'portfolio', entry: { slug: 'new-project' } },
      );
      expect(result.success).toBe(true);
      expect(mockStrapiProjectSyncService.syncPortfolioToOdoo).toHaveBeenCalledWith('new-project');
    });

    it('calls syncPortfolioToOdoo on entry.update', async () => {
      await controller.handleWebhook(
        'test-strapi-secret-at-least-32-chars-long!!',
        { event: 'entry.update', model: 'portfolio', entry: { slug: 'updated-project' } },
      );
      expect(mockStrapiProjectSyncService.syncPortfolioToOdoo).toHaveBeenCalledWith('updated-project');
    });

    it('calls syncPortfolioToOdoo on entry.publish', async () => {
      await controller.handleWebhook(
        'test-strapi-secret-at-least-32-chars-long!!',
        { event: 'entry.publish', model: 'portfolio', entry: { slug: 'published-project' } },
      );
      expect(mockStrapiProjectSyncService.syncPortfolioToOdoo).toHaveBeenCalledWith('published-project');
    });

    it('does not call sync on entry.delete (intentional safety)', async () => {
      await controller.handleWebhook(
        'test-strapi-secret-at-least-32-chars-long!!',
        { event: 'entry.delete', model: 'portfolio', entry: { slug: 'deleted-project' } },
      );
      expect(mockStrapiProjectSyncService.syncPortfolioToOdoo).not.toHaveBeenCalled();
    });
  });

  // ── Non-portfolio models ────────────────────────────────────────────

  describe('non-portfolio models', () => {
    it('ignores events for models other than portfolio', async () => {
      const result = await controller.handleWebhook(
        'test-strapi-secret-at-least-32-chars-long!!',
        { event: 'entry.create', model: 'category', entry: { slug: 'residential' } },
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain('not mapped');
      expect(mockStrapiProjectSyncService.syncPortfolioToOdoo).not.toHaveBeenCalled();
    });
  });

  // ── Missing or empty slug ───────────────────────────────────────────

  describe('edge cases', () => {
    it('skips entries without a slug', async () => {
      const result = await controller.handleWebhook(
        'test-strapi-secret-at-least-32-chars-long!!',
        { event: 'entry.create', model: 'portfolio', entry: { title: 'No Slug' } },
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain('no slug');
      expect(mockStrapiProjectSyncService.syncPortfolioToOdoo).not.toHaveBeenCalled();
    });

    it('extracts slug from nested attributes (Strapi v4/v5 shape)', async () => {
      await controller.handleWebhook(
        'test-strapi-secret-at-least-32-chars-long!!',
        {
          event: 'entry.create',
          model: 'portfolio',
          entry: { attributes: { slug: 'nested-slug' } },
        },
      );
      expect(mockStrapiProjectSyncService.syncPortfolioToOdoo).toHaveBeenCalledWith('nested-slug');
    });
  });

  // ── Unhandled event type ────────────────────────────────────────────

  describe('unhandled event', () => {
    it('logs but does not crash on unknown event type', async () => {
      const result = await controller.handleWebhook(
        'test-strapi-secret-at-least-32-chars-long!!',
        { event: 'entry.unlink', model: 'portfolio', entry: { slug: 'test' } },
      );
      expect(result.success).toBe(true);
      // Should not call sync for unhandled events
      expect(mockStrapiProjectSyncService.syncPortfolioToOdoo).not.toHaveBeenCalled();
    });
  });
});
