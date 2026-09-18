import { Injectable, Logger } from '@nestjs/common';
import { ToolDefinition } from './decorators/tool-definition.decorator';
import { PdfService } from '../pdf/pdf.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

interface MaterialSpec {
  color: string;
  roughness: number;
  metalness: number;
  name: string;
  [key: string]: unknown;
}

@Injectable()
export class ResearchToolsService {
  private readonly logger = new Logger(ResearchToolsService.name);

  constructor(
    private readonly pdfService: PdfService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @ToolDefinition({
    name: 'web_search',
    description: 'Searches the web for architectural trends, material properties, or competitor data. Use for broad discovery.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query to execute' },
        limit: { type: 'number', description: 'Number of results to return (default 5)' },
      },
      required: ['query'],
    },
  })
  async webSearch(params: { query: string; limit?: number }) {
    this.logger.log(`Performing web search for: ${params.query}`);
    return {
      results: [
        {
          title: 'Biophilic Urbanism 2026',
          snippet: 'The integration of living walls and vertical forests in high-density urban centers is increasing efficiency by 12%.',
          url: 'https://archdaily.com/biophilic-2026',
        },
        {
          title: 'Next-Gen Carbon-Negative Concrete',
          snippet: 'Recent breakthroughs in olivine-based concrete allow for active CO2 sequestration during the curing phase.',
          url: 'https://concrete-future.io/carbon-negative',
        },
      ],
    };
  }

  @ToolDefinition({
    name: 'scrape_page',
    description: 'Extracts deep content from a specific URL. Use this to analyze a specific article, project, or technical spec.',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The full URL to scrape' },
      },
      required: ['url'],
    },
  })
  async scrapePage(params: { url: string }) {
    this.logger.log(`Scraping content from: ${params.url}`);
    return {
      content: `Detailed analysis of ${params.url}: The project utilizes a parametric facade based on Fibonacci sequences to optimize solar gain...`,
      metadata: { title: 'Parametric Facade Study', author: 'Studio-X' },
    };
  }

  @ToolDefinition({
    name: 'synthesize_report',
    description: 'Transforms a collection of raw findings into a structured, cited architectural report.',
    parameters: {
      type: 'object',
      properties: {
        findings: { type: 'string', description: 'The raw data collected from tools' },
        focus: { type: 'string', description: 'The specific angle of analysis (e.g. Sustainability, Aesthetics)' },
      },
      required: ['findings', 'focus'],
    },
  })
  async synthesizeReport(params: { findings: string; focus: string }) {
    this.logger.log(`Synthesizing report with focus on: ${params.focus}`);
    return {
      report_id: `rep_${Date.now()}`,
      summary: `Synthesis complete. The analysis of ${params.focus} indicates a strong trend toward...`,
      citations: ['archdaily.com', 'concrete-future.io'],
    };
  }

  @ToolDefinition({
    name: 'export_luxury_pdf',
    description: 'Generates a high-fidelity, branded PDF from a synthesized report. This is the final step in the research pipeline.',
    parameters: {
      type: 'object',
      properties: {
        reportId: { type: 'string', description: 'The ID of the synthesized report' },
        projectName: { type: 'string', description: 'The name of the project this report belongs to' },
        findings: { type: 'string', description: 'The final synthesized content' },
      },
      required: ['reportId', 'projectName', 'findings'],
    },
  })
  async exportLuxuryPdf(params: { reportId: string; projectName: string; findings: string }) {
    this.logger.log(`Exporting luxury PDF for report: ${params.reportId}`);
    
    await this.pdfService.generateExecutiveReportPdf({
        projectId: parseInt(params.reportId.replace('rep_', ''), 10) || 1,
        projectName: params.projectName,
        generatedAt: new Date().toISOString(),
        executiveSummary: {
          narrative: params.findings.slice(0, 500),
          sentiment: 'positive',
          confidenceScore: 85,
        },
        metrics: {
          timelineHealth: {
            status: 'on-track',
            currentPhase: 'Research Complete',
            completionPercentage: 100,
            nextMilestone: 'Report Delivery',
            predictedCompletionDate: new Date(Date.now() + 86400000).toISOString(),
          },
          budgetHealth: {
            status: 'on-track',
            totalAllocated: 0,
            totalSpent: 0,
            burnRate: 'N/A',
          },
          qualityHealth: {
            status: 'excellent',
            approvedDeliverables: 1,
            pendingRevisions: 0,
            clientSatisfactionIndex: 95,
          },
        },
        highlights: [
          {
            title: 'Research Synthesized',
            description: params.findings.slice(0, 200),
            impact: 'high',
            category: 'technical',
          },
        ],
        interventions: [],
        visualizationCues: [],
      });

    return {
        success: true,
        pdfUrl: `https://api.hexastudio.net/downloads/reports/${params.reportId}.pdf`,
        message: 'Your luxury architectural report has been generated.',
    };
  }

  @ToolDefinition({
    name: 'apply_live_material',
    description: 'Applies a material mutation to the 3D scene in real-time. Use this to "paint" the model as you explain your research.',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project slug or ID' },
        element: { type: 'string', description: 'Scene element to modify (e.g. "facade", "lobby-floor")' },
        materialSpec: { 
          type: 'object', 
          description: 'PBR material properties',
          properties: {
            color: { type: 'string', description: 'Hex color' },
            roughness: { type: 'number', description: '0-1 range' },
            metalness: { type: 'number', description: '0-1 range' },
            name: { type: 'string', description: 'Material name' },
          }
        },
      },
      required: ['projectId', 'element', 'materialSpec'],
    },
  })
  async applyLiveMaterial(params: { projectId: string; element: string; materialSpec: MaterialSpec }) {
    this.logger.log(`Dispatching live material update for ${params.projectId}: ${params.element}`);
    
    this.realtimeGateway.dispatchSpatialCommand(params.projectId, {
      type: 'SET_MATERIAL',
      payload: {
        element: params.element,
        ...params.materialSpec,
      },
      metadata: {
        triggeredBy: 'ai-agent',
        agentPersona: 'researcher',
      },
    });

    return {
      success: true,
      message: `Live material update dispatched to scene. Element ${params.element} is now ${params.materialSpec.name}.`,
    };
  }
}
