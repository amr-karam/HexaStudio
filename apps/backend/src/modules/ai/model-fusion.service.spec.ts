import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, vi } from 'vitest';
import { ModelFusionService } from './model-fusion.service';
import { AiChatService } from './ai-chat.service';
import { TokenUsageService } from './token-usage.service';

describe('ModelFusionService', () => {
  let service: ModelFusionService;
  let aiChat: AiChatService;
  let tokenUsage: TokenUsageService;

  const createCompletion = (model: string, content: string) =>
    Promise.resolve({
      content,
      model,
      provider: 'local',
      usage: { promptTokens: 10, completionTokens: 20 },
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelFusionService,
        {
          provide: AiChatService,
          useValue: {
            complete: vi.fn().mockImplementation(({ model }: { model?: string }) => {
              const text = model?.includes('fallback')
                ? 'Short answer.'
                : 'Detailed answer with bullets.\n- Step 1\n- Step 2\n- Step 3';
              return createCompletion(model ?? 'default', text);
            }),
            selectModelFor: vi.fn().mockReturnValue({ model: 'gemma-4-12b-it-qat', reasoning: 'complex' }),
            isAvailable: true,
            provider: 'local',
            model: 'gemma-4-12b-it-qat',
          },
        },
        {
          provide: TokenUsageService,
          useValue: {
            recordUsage: vi.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get(ModelFusionService);
    aiChat = module.get(AiChatService);
    tokenUsage = module.get(TokenUsageService);
  });

  it('should fuse multiple model outputs and return best result', async () => {
    const response = await service.fuse({
      messages: [{ role: 'user', content: 'Analyze project brief.' }],
      models: ['gemma-4-12b-it-qat', 'gpt-4o-mini'],
      mode: 'best',
    });

    expect(response.candidates).toHaveLength(2);
    expect(response.candidates.every(c => c.failure === false)).toBe(true);
    expect(response.fused.content).toContain('- Step 1');
    expect(response.winnerScore).toBeGreaterThan(0);
    expect(tokenUsage.recordUsage).toHaveBeenCalledTimes(2);
  });

  it('should merge outputs in merge mode and deduplicate identical candidates', async () => {
    const response = await service.fuse({
      messages: [{ role: 'user', content: 'Generate proposal outline.' }],
      models: ['gemma-4-12b-it-qat', 'gemma-4-12b-it-qat'],
      mode: 'merge',
    });

    expect(response.fused.mode).toBe('merge');
    expect(response.fused.content).toContain('- Step 1');
    expect(response.candidates).toHaveLength(2);
  });

  it('should handle partial failures gracefully', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelFusionService,
        {
          provide: AiChatService,
          useValue: {
            complete: vi
              .fn()
              .mockResolvedValueOnce({
                content: 'A',
                model: 'model-a',
                provider: 'local',
              })
              .mockRejectedValueOnce(new Error('provider down'))
              .mockResolvedValueOnce({
                content: 'B',
                model: 'model-c',
                provider: 'local',
              }),
            selectModelFor: vi.fn().mockReturnValue({ model: 'model-a', reasoning: 'complex' }),
            isAvailable: true,
            provider: 'local',
            model: 'model-a',
          },
        },
        {
          provide: TokenUsageService,
          useValue: {
            recordUsage: vi.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    const fusionService = module.get(ModelFusionService);
    const response = await fusionService.fuse({
      messages: [{ role: 'user', content: 'Plan marketing rollout.' }],
      models: ['model-a', 'model-b', 'model-c'],
      mode: 'best',
    });

    expect(response.candidates).toHaveLength(3);
    const failedCandidate = response.candidates.find(c => c.model === 'model-b');
    expect(failedCandidate?.failure).toBe(true);
    expect(response.fused.content).not.toBe('');
  });
});
