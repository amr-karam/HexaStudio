import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ResearchToolsService } from './research-tools.service';
import { PdfService } from '../pdf/pdf.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const mockPdfService = {
  generateExecutiveReportPdf: vi.fn(),
};

const mockRealtimeGateway = {
  dispatchSpatialCommand: vi.fn(),
};

describe('ResearchToolsService', () => {
  let service: ResearchToolsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResearchToolsService,
        { provide: PdfService, useValue: mockPdfService },
        { provide: RealtimeGateway, useValue: mockRealtimeGateway },
      ],
    }).compile();

    service = module.get<ResearchToolsService>(ResearchToolsService);
  });

  describe('webSearch', () => {
    it('returns hardcoded architectural search results', async () => {
      const result = await service.webSearch({ query: 'biophilic design', limit: 5 });

      expect(result.results).toHaveLength(2);
      expect(result.results[0].title).toBe('Biophilic Urbanism 2026');
      expect(result.results[0].url).toBe('https://archdaily.com/biophilic-2026');
      expect(result.results[1].title).toBe('Next-Gen Carbon-Negative Concrete');
    });
  });

  describe('scrapePage', () => {
    it('returns analyzed content from the given URL', async () => {
      const result = await service.scrapePage({ url: 'https://example.com/article' });

      expect(result.content).toContain('https://example.com/article');
      expect(result.metadata.title).toBe('Parametric Facade Study');
      expect(result.metadata.author).toBe('Studio-X');
    });
  });

  describe('synthesizeReport', () => {
    it('returns a structured report with citations', async () => {
      const result = await service.synthesizeReport({
        findings: 'raw research data',
        focus: 'Sustainability',
      });

      expect(result.report_id).toMatch(/^rep_\d+$/);
      expect(result.summary).toContain('Synthesis complete');
      expect(result.summary).toContain('Sustainability');
      expect(result.citations).toEqual(['archdaily.com', 'concrete-future.io']);
    });
  });

  describe('exportLuxuryPdf', () => {
    it('delegates to PdfService and returns a download URL', async () => {
      const mockBuffer = Buffer.from('fake-pdf-binary');
      mockPdfService.generateExecutiveReportPdf.mockResolvedValue(mockBuffer);

      const result = await service.exportLuxuryPdf({
        reportId: 'rep_42',
        projectName: 'Lumina Tower',
        findings: 'A detailed synthesis of biophilic facade trends...',
      });

      expect(mockPdfService.generateExecutiveReportPdf).toHaveBeenCalledTimes(1);
      const reportArg = mockPdfService.generateExecutiveReportPdf.mock.calls[0][0];
      expect(reportArg.projectName).toBe('Lumina Tower');
      expect(reportArg.executiveSummary.narrative).toContain('biophilic');
      expect(reportArg.metrics.timelineHealth.status).toBe('on-track');
      expect(reportArg.metrics.budgetHealth.burnRate).toBe('N/A');
      expect(reportArg.metrics.qualityHealth.clientSatisfactionIndex).toBe(95);
      expect(reportArg.highlights).toHaveLength(1);
      expect(reportArg.highlights[0].category).toBe('technical');

      expect(result.success).toBe(true);
      expect(result.pdfUrl).toContain('reports/rep_42.pdf');
      expect(result.message).toContain('luxury architectural report');
    });

    it('extracts a numeric project ID from the report ID', async () => {
      mockPdfService.generateExecutiveReportPdf.mockResolvedValue(Buffer.from('ok'));

      await service.exportLuxuryPdf({
        reportId: 'rep_123',
        projectName: 'Test Project',
        findings: 'test findings',
      });

      const reportArg = mockPdfService.generateExecutiveReportPdf.mock.calls[0][0];
      expect(reportArg.projectId).toBe(123);
    });
  });

  describe('applyLiveMaterial', () => {
    it('dispatches a spatial command and returns success', async () => {
      mockRealtimeGateway.dispatchSpatialCommand.mockImplementation(() => {});

      const result = await service.applyLiveMaterial({
        projectId: 'proj-1',
        element: 'facade',
        materialSpec: {
          color: '#3b82f6',
          roughness: 0.5,
          metalness: 0.8,
          name: 'Anodized Aluminum',
        },
      });

      expect(mockRealtimeGateway.dispatchSpatialCommand).toHaveBeenCalledTimes(1);
      const [projectId, command] = mockRealtimeGateway.dispatchSpatialCommand.mock.calls[0];
      expect(projectId).toBe('proj-1');
      expect(command.type).toBe('SET_MATERIAL');
      expect(command.payload.element).toBe('facade');
      expect(command.payload.color).toBe('#3b82f6');
      expect(command.payload.roughness).toBe(0.5);
      expect(command.payload.metalness).toBe(0.8);
      expect(command.payload.name).toBe('Anodized Aluminum');
      expect(command.metadata.triggeredBy).toBe('ai-agent');
      expect(command.metadata.agentPersona).toBe('researcher');

      expect(result.success).toBe(true);
      expect(result.message).toContain('facade');
      expect(result.message).toContain('Anodized Aluminum');
    });
  });
});
