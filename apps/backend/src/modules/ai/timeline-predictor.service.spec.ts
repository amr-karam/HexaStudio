import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TimelinePredictorService } from './timeline-predictor.service';
import { StructuredOutputService } from './structured-output.service';
import { TimelinePrediction, TimelinePredictionSchema } from './timeline-prediction.schema';

const mockPrediction: TimelinePrediction = {
  riskScore: 78,
  predictedDelayDays: 12,
  confidence: 0.82,
  riskLevel: 'at_risk',
  predictedCompletionDate: '2026-11-05T00:00:00.000Z',
  factors: [
    'Revision count above threshold (4)',
    'Recent activity dropped below 2 events per week',
    'Milestone window less than 20% of remaining schedule',
  ],
  recommendedActions: [
    'Schedule a client sync to lock the scope',
    'Increase review cadence to twice weekly',
    'Assign a dedicated production lead',
  ],
};

const mockStructuredOutputService = {
  generateStructuredOutput: vi.fn(),
};

describe('TimelinePredictorService', () => {
  let service: TimelinePredictorService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimelinePredictorService,
        { provide: StructuredOutputService, useValue: mockStructuredOutputService },
      ],
    }).compile();

    service = module.get<TimelinePredictorService>(TimelinePredictorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('predict', () => {
    it('returns a validated prediction from project signals', async () => {
      mockStructuredOutputService.generateStructuredOutput.mockResolvedValue(mockPrediction);

      const result = await service.predict({
        projectId: 'proj-42',
        projectName: 'Meridian Tower',
        projectType: 'tower',
        progress: 45,
        daysUntilNextMilestone: 18,
        revisionCount: 4,
        recentActivityCount: 1,
        historicalAvgCompletionDays: 120,
        historicalOnTimeRate: 0.6,
        description: 'Luxury residential tower, 40 stories.',
      });

      expect(result).toEqual(mockPrediction);
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledTimes(1);
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledWith(
        expect.stringContaining('Meridian Tower'),
        TimelinePredictionSchema,
        expect.objectContaining({ temperature: 0.2 }),
      );
    });

    it('uses a conservative default baseline when history is absent', async () => {
      mockStructuredOutputService.generateStructuredOutput.mockResolvedValue({
        riskScore: 20,
        predictedDelayDays: 0,
        confidence: 0.7,
        riskLevel: 'on_track',
        factors: ['Healthy progress cadence'],
        recommendedActions: ['Continue current plan'],
      });

      const result = await service.predict({
        projectId: 'proj-1',
        projectName: 'Villa S',
        projectType: 'villa',
        progress: 80,
        daysUntilNextMilestone: 25,
        revisionCount: 1,
        recentActivityCount: 6,
      });

      expect(result.riskLevel).toBe('on_track');
      expect(result.predictedDelayDays).toBe(0);
      // The prompt should embed the default 90-day baseline
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledWith(
        expect.stringContaining('90 days'),
        expect.anything(),
        expect.anything(),
      );
    });
  });
});
