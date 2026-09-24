import { Injectable, Logger } from '@nestjs/common';
import { MultimodalService } from '../../ai/multimodal.service';
import { VectorMemoryService } from '../../memory/vector/vector-memory.service';
import { DesignAuditService } from './design-audit.service';

export interface LuxuryForgeRequest {
  prompt: string;
  context?: string;
  iterationLimit?: number;
}

export interface LuxuryForgeResult {
  finalCode: string;
  iterations: number;
  finalScore: number;
  critiqueHistory: Array<{ iteration: number; score: number; assessment: string }>;
}

@Injectable()
export class LuxuryForgeService {
  private readonly logger = new Logger(LuxuryForgeService.name);

  constructor(
    private readonly multimodalService: MultimodalService,
    private readonly auditService: DesignAuditService,
    private readonly memoryService: VectorMemoryService,
  ) {}

  async forgeComponent(request: LuxuryForgeRequest): Promise<LuxuryForgeResult> {
    const { prompt, context = 'Luxury UI Component', iterationLimit = 3 } = request;
    
    // 1. Retrieve high-score components for few-shot prompting
    const luxuryExamples = await this.memoryService.search('high luxury score components', { limit: 3 });
    const examplesContext = luxuryExamples.map(ex => ex.content).join('\n---\n');

    let currentCode = '';
    let currentScore = 0;
    let iteration = 0;
    const critiqueHistory = [];

    while (iteration < iterationLimit) {
      iteration++;
      this.logger.log(`Luxury Forge: Iteration ${iteration}/${iterationLimit} for ${context}`);

      if (iteration === 1) {
        // Initial Generation
        currentCode = await this.generateInitialDraft(prompt, context, examplesContext);
      } else {
        // Refine based on previous audit
        const lastAudit = critiqueHistory[critiqueHistory.length - 1];
        currentCode = await this.refineDraft(prompt, currentCode, lastAudit.assessment);
      }

      // 2. Audit the current iteration
      const auditResult = await this.auditService.auditDesign({ tsx: currentCode }, context);
      currentScore = auditResult.luxuryScore;

      critiqueHistory.push({
        iteration,
        score: currentScore,
        assessment: auditResult.editorialAssessment,
      });

      // 3. Exit early if we hit absolute luxury
      if (currentScore >= 100) {
        this.logger.log(`Luxury Forge: Absolute luxury achieved at iteration ${iteration}!`);
        break;
      }
    }

    return {
      finalCode: currentCode,
      iterations: iteration,
      finalScore: currentScore,
      critiqueHistory,
    };
  }

  private async generateInitialDraft(prompt: string, context: string, examples: string): Promise<string> {
    const forgePrompt = `
      You are the HEXA STUDIO Luxury Architect.
      Your goal is to generate a React component that is born with a 100 Luxury Score.

      ### DESIGN SYSTEM CONSTRAINTS
      - Colors: Void (#050505), Obsidian (#0F0F10), Gold (#D4AF37).
      - Typography: Editorial Serifs for headings, Mono (wide tracking 0.3em-0.5em) for labels.
      - Motion: Use --hexa-ease-* tokens only.
      - Style: Brutalist luxury, high contrast, generous whitespace.

      ### SUCCESS EXAMPLES
      ${examples}

      ### TASK
      Component: ${context}
      Prompt: ${prompt}

      Return ONLY the complete TSX code. No markdown, no explanations.
    `;

    return this.multimodalService.generateText(forgePrompt);
  }

  private async refineDraft(prompt: string, currentCode: string, critique: string): Promise<string> {
    const refinePrompt = `
      You are the HEXA STUDIO Luxury Architect.
      You are refining a component to eliminate "Design Slop".

      ### CURRENT CODE
      ${currentCode}

      ### CRITIQUE TO RESOLVE
      ${critique}

      ### TASK
      Apply a surgical refactor to resolve the critique and reach a 100 luxury score.
      Maintain the original intent: ${prompt}

      Return ONLY the complete, refactored TSX code. No markdown, no explanations.
    `;

    return this.multimodalService.generateText(refinePrompt);
  }
}
