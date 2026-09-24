import { Injectable, Logger } from '@nestjs/common';
import { MultimodalService } from '../../ai/multimodal.service';
import { VectorMemoryService } from '../../memory/vector/vector-memory.service';
import { DesignMetricsService } from '../../metrics/services/design-metrics.service';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

export interface PageBalanceResult {
  balanced: boolean;
  voidRatio: number;
  obsidianRatio: number;
  goldRatio: number;
  score: number;
}

export interface DesignAuditResult {
  luxuryScore: number;
  violations: Array<{
    token: string;
    issue: string;
    severity: 'critical' | 'warning';
    correction: string;
  }>;
  editorialAssessment: string;
  isApproved: boolean;
  luxuryTrend?: 'improving' | 'declining' | 'stable';
  previousScore?: number;
  suggestedRefactor?: string;
}

@Injectable()
export class DesignAuditService {
  private readonly logger = new Logger(DesignAuditService.name);
  private readonly designSystemPath = join(process.cwd(), 'DESIGN_SYSTEM.md');

  // Cache: Key = content hash, Value = { result, timestamp }
  // TTL: 1 hour (3600000 ms). Adjust based on how quickly design changes.
  private readonly auditCache = new Map<string, { result: DesignAuditResult; timestamp: number }>();
  private readonly cacheTtl = 3600000; // 1 hour

  constructor(
    private readonly multimodalService: MultimodalService,
    private readonly memoryService: VectorMemoryService,
    private readonly designMetrics: DesignMetricsService,
  ) {}

  private getFileHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTtl;
  }

  async auditDesign(
    content: {
      tsx?: string;
      image?: { mimeType: string; data: string };
    },
    context: string = 'UI Component',
  ): Promise<DesignAuditResult> {
    const designSystem = readFileSync(this.designSystemPath, 'utf8');
    
    // 1. Check Cache
    const contentToHash = content.tsx || context;
    const fileHash = this.getFileHash(contentToHash);
    const cachedEntry = this.auditCache.get(fileHash);

    if (cachedEntry && this.isCacheValid(cachedEntry.timestamp)) {
      this.logger.log(`Cache hit for ${contentToHash.substring(0, 20)}... returning cached result.`);
      // Return a frozen copy of the cached result to avoid mutation issues
      return { ...cachedEntry.result };
    }

    // 2. Retrieve the most similar previous audit for this component
    const query = content.tsx || context;
    const previousAudits = await this.memoryService.search(query, { limit: 1 });
    const lastAudit = previousAudits[0]?.content ? JSON.parse(previousAudits[0].content) : null;

    const prompt = `
      You are the HEXA STUDIO Design Critic, the ultimate authority on visual luxury.
      Your mission is to purge "Design Slop" and ensure absolute adherence to the DESIGN SYSTEM.

      ### THE SUPREME LAW (DESIGN SYSTEM)
      ${designSystem}

      ### AUDIT TARGET
      Context: ${context}
      ${content.tsx ? `Code Snippet: \n${content.tsx}` : ''}

      ${lastAudit ? `
      ### PREVIOUS ITERATION (For Comparison)
      Previous Score: ${lastAudit.luxuryScore}
      Previous Critique: ${lastAudit.editorialAssessment}
      
      Compare the current target against the previous iteration. Is the luxury improving or declining?` : ''}

      ### CRITICAL CHECKLIST
      1. 60-30-10 Rule: Is the balance between Void (#050505), Obsidian (#0F0F10), and Gold (#D4AF37) maintained?
      2. WCAG Contrast Ratio: Do text vs background contrast ratios meet WCAG AA (4.5:1) or AAA (7:1) standards? Flag any failing ratios with suggested fixes.
      3. Token Purge: Are there raw beziers, generic Tailwind colors (e.g., bg-blue-500), or hardcoded hexes not in the system?
      4. Editorial Typography: Do Mono labels use the canonical wide tracking (0.3em - 0.5em)? Are serif headings tight?
      5. Motion: Are raw easings used instead of --hexa-ease-* tokens?

      ### OUTPUT FORMAT
      Return a JSON object with:
      - luxuryScore: (0-100)
      - violations: [{ token, issue, severity, correction }]
      - editorialAssessment: (Brief, sharp critique. If a previous version exists, comment on the evolution of the luxury)
      - isApproved: (true if luxuryScore > 90 and no critical violations)
      - luxuryTrend: ('improving' | 'declining' | 'stable' - only if previous iteration provided)
      - suggestedRefactor: (The complete, corrected TSX code that eliminates all violations and achieves a 100 luxury score. Return only the code)
    `;

    const images = content.image ? [content.image] : [];
    
    const result = (await this.multimodalService.generateVision(
      prompt,
      images,
      0.2,
      1500,
    )) as unknown as DesignAuditResult;

    if (lastAudit) {
      result.previousScore = lastAudit.luxuryScore;
    }

    // 3. Record telemetry for Prometheus
    this.designMetrics.recordAudit(
      context, 
      result.luxuryScore, 
      result.isApproved, 
      result.violations.map(v => ({ token: v.token, severity: v.severity }))
    );

    // 4. Store in Cache (overwrite if exists, update timestamp)
    this.auditCache.set(fileHash, { result, timestamp: Date.now() });

    // 5. Store this audit as a new memory snapshot
    await this.memoryService.add(
      `Design Audit: ${context}`, 
      JSON.stringify(result), 
      { metadata: { tsx: content.tsx, timestamp: new Date().toISOString() } }
    );

    return result;
  }

  async auditPageBalance(imageData: string, _mimeType: string): Promise<PageBalanceResult> {
    const prompt = `Analyze the color distribution of this UI design image. Estimate the percentage coverage of Void (#050505), Obsidian (#0F0F10), and Gold (#D4AF37). Report whether the 60-30-10 balance rule is maintained.`;
    const images = [{ mimeType: _mimeType || 'image/jpeg', data: imageData }];
    const result = (await this.multimodalService.generateVision(
      prompt,
      images,
      0.1,
      500,
    )) as unknown as PageBalanceResult;
    return result;
  }
}