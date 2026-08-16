import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { LeadScoringService } from './lead-scoring.service';
import { StructuredOutputService } from './structured-output.service';
import { LeadScore, LeadScoreSchema } from './lead-score.schema';

const mockScore: LeadScore = {
  tier: 'high_value',
  score: 92,
  estimatedBudgetRange: '1m+',
  projectComplexity: 'high',
  locationFit: 'international',
  recommendedPriority: 'immediate_follow_up',
  reasons: [
    'Named developer with a clear luxury residential brief',
    'Budget exceeds $1M threshold',
    'Portfolio-grade masterplan scope',
  ],
};

const mockStructuredOutputService = {
  generateStructuredOutput: vi.fn(),
};

describe('LeadScoringService', () => {
  let service: LeadScoringService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadScoringService,
        { provide: StructuredOutputService, useValue: mockStructuredOutputService },
      ],
    }).compile();

    service = module.get<LeadScoringService>(LeadScoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scoreLead', () => {
    it('returns a validated lead score from inquiry details', async () => {
      mockStructuredOutputService.generateStructuredOutput.mockResolvedValue(mockScore);

      const result = await service.scoreLead({
        name: 'Jane Architect',
        company: 'Acme Developments',
        email: 'jane@acme.dev',
        service: 'Architectural Visualization',
        budget: '$1.5M',
        location: 'Dubai',
        message: 'We are developing a 40-story luxury tower and need cinematic renders.',
      });

      expect(result).toEqual(mockScore);
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledTimes(1);
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledWith(
        expect.stringContaining('Jane Architect'),
        LeadScoreSchema,
        expect.objectContaining({ temperature: 0.2 }),
      );
    });

    it('passes through optional fields gracefully', async () => {
      mockStructuredOutputService.generateStructuredOutput.mockResolvedValue({
        tier: 'inquiry',
        score: 40,
        estimatedBudgetRange: 'unknown',
        projectComplexity: 'unknown',
        locationFit: 'unknown',
        recommendedPriority: 'nurture',
        reasons: ['Insufficient detail provided'],
      });

      const result = await service.scoreLead({
        name: 'Anonymous',
        email: 'anon@example.com',
        message: 'Hi, I would like more information.',
      });

      expect(result.tier).toBe('inquiry');
      expect(result.recommendedPriority).toBe('nurture');
    });

    it('sanitizes user-supplied fields before sending them to the model', async () => {
      mockStructuredOutputService.generateStructuredOutput.mockResolvedValue(mockScore);

      await service.scoreLead({
        name: 'Jane \u0000Architect',
        email: 'jane@acme.dev',
        message: '  Luxury tower \u001B project  ',
      });

      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledWith(
        expect.stringContaining('Jane Architect'),
        LeadScoreSchema,
        expect.objectContaining({ temperature: 0.2 }),
      );
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledWith(
        expect.not.stringContaining('\u0000'),
        LeadScoreSchema,
        expect.objectContaining({ temperature: 0.2 }),
      );
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledWith(
        expect.not.stringContaining('\u001B'),
        LeadScoreSchema,
        expect.objectContaining({ temperature: 0.2 }),
      );
    });
  });

  describe('toTags', () => {
    it('maps a lead score to Odoo tag strings', () => {
      const tags = service.toTags(mockScore);

      expect(tags).toContain('high_value');
      expect(tags).toContain('score:92');
      expect(tags).toContain('budget:1m+');
      expect(tags).toContain('complexity:high');
      expect(tags).toContain('priority:immediate_follow_up');
    });
  });
});
