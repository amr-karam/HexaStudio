import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { SpatialSynthesisService } from './spatial-synthesis.service';
import { StructuredOutputService } from './structured-output.service';
import { VoiceService } from './voice.service';
import { SpatialBrief, SpatialBriefSchema } from './spatial-brief.schema';

const mockBrief: SpatialBrief = {
  atmosphere: 'Sophisticated Luxury & Spatial Balance',
  recommendedLighting: 'golden_hour',
  recommendedMaterial: 'obsidian_marble',
  colorPalette: ['#121212', '#D4AF37', '#707070', '#F5F5F7'],
  designRationale: 'Curated spatial synthesis for test concept.',
};

const mockStructuredOutputService = {
  generateStructuredOutput: vi.fn(),
};

const mockVoiceService = {
  isAvailable: true,
  transcribeAudio: vi.fn(),
};

describe('SpatialSynthesisService', () => {
  let service: SpatialSynthesisService;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockVoiceService.isAvailable = true;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpatialSynthesisService,
        { provide: StructuredOutputService, useValue: mockStructuredOutputService },
        { provide: VoiceService, useValue: mockVoiceService },
      ],
    }).compile();

    service = module.get<SpatialSynthesisService>(SpatialSynthesisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('synthesizeFromPrompt', () => {
    it('returns a validated spatial brief from a text prompt', async () => {
      mockStructuredOutputService.generateStructuredOutput.mockResolvedValue(mockBrief);

      const result = await service.synthesizeFromPrompt('minimal concrete retreat');

      expect(result).toEqual(mockBrief);
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledTimes(1);
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledWith(
        expect.stringContaining('minimal concrete retreat'),
        SpatialBriefSchema,
        expect.objectContaining({ temperature: 0.4 }),
      );
    });

    it('propagates structured output failures', async () => {
      mockStructuredOutputService.generateStructuredOutput.mockRejectedValue(
        new Error('Failed to generate valid structured output'),
      );

      await expect(service.synthesizeFromPrompt('warm oak cabin')).rejects.toThrow(
        'Failed to generate valid structured output',
      );
    });

    it('sanitizes the prompt before building the synthesis prompt', async () => {
      mockStructuredOutputService.generateStructuredOutput.mockResolvedValue(mockBrief);

      await service.synthesizeFromPrompt('  luxury villa \u0000\u001B  ');

      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledWith(
        expect.stringContaining('luxury villa'),
        SpatialBriefSchema,
        expect.objectContaining({ temperature: 0.4 }),
      );
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledWith(
        expect.not.stringContaining('\u0000'),
        SpatialBriefSchema,
        expect.objectContaining({ temperature: 0.4 }),
      );
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledWith(
        expect.not.stringContaining('\u001B'),
        SpatialBriefSchema,
        expect.objectContaining({ temperature: 0.4 }),
      );
    });
  });

  describe('synthesizeFromAudio', () => {
    it('chains transcription into the structured synthesis prompt', async () => {
      const transcription = 'Create a cyberpunk penthouse with brushed titanium surfaces';
      mockVoiceService.transcribeAudio.mockResolvedValue(transcription);
      mockStructuredOutputService.generateStructuredOutput.mockResolvedValue(mockBrief);

      const result = await service.synthesizeFromAudio('base64-audio-data', 'audio/webm');

      expect(mockVoiceService.transcribeAudio).toHaveBeenCalledTimes(1);
      expect(mockVoiceService.transcribeAudio).toHaveBeenCalledWith(
        'base64-audio-data',
        'audio/webm',
      );
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledTimes(1);
      expect(mockStructuredOutputService.generateStructuredOutput).toHaveBeenCalledWith(
        expect.stringContaining(transcription),
        SpatialBriefSchema,
        expect.objectContaining({ temperature: 0.4 }),
      );
      expect(result).toEqual(mockBrief);
    });

    it('throws a clear error when the voice service is unavailable', async () => {
      mockVoiceService.isAvailable = false;

      await expect(
        service.synthesizeFromAudio('base64-audio-data', 'audio/webm'),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);

      expect(mockVoiceService.transcribeAudio).not.toHaveBeenCalled();
      expect(mockStructuredOutputService.generateStructuredOutput).not.toHaveBeenCalled();
    });
  });
});
