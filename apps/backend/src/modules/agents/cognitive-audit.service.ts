import { Injectable, Logger } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentMemoryService } from './agent-memory.service';
import { ProjectsService } from '../projects/projects.service';

export interface AuditResult {
  score: number; // 0 to 1
  issues: string[];
  status: 'PASS' | 'WARN' | 'FAIL';
}

@Injectable()
export class CognitiveAuditService {
  private readonly logger = new Logger(CognitiveAuditService.name);

  constructor(
    private readonly agentsService: AgentsService,
    private readonly memory: AgentMemoryService,
    private readonly projectsService: ProjectsService,
  ) {}

  /**
   * Performs a comprehensive audit of a specific agent session.
   * Checks for reasoning drift, fact accuracy, and design compliance.
   */
  async auditSession(persona: string, sessionId: string): Promise<AuditResult> {
    this.logger.log(`Initiating cognitive audit for session: ${sessionId} (${persona})`);
    
    const issues: string[] = [];
    let totalScore = 1.0;

    // 1. Reasoning Audit: Check if the agent is using <thought> blocks correctly
    const history = await this.memory.getHistory(persona, sessionId);
    const thoughtBlocks = history.filter(h => h.content?.includes('<thought>'));
    
    if (thoughtBlocks.length < history.length * 0.5) {
      issues.push('Reasoning Drift: Agent is skipping <thought> blocks in more than 50% of interactions.');
      totalScore -= 0.3;
    }

    // 2. Fact Accuracy Audit: Cross-reference Redis facts with Source of Truth
    const facts = await this.memory.getAllFacts(persona, sessionId);
    const projectSlug = facts.projectId as string;
    
    if (projectSlug) {
      try {
        const actualProject = await this.projectsService.getProjectBySlug(projectSlug);
        // Compare a sample of facts (e.g., project name or category)
        if (facts.category && actualProject.category?.name !== facts.category) {
          issues.push(`Fact Mismatch: Memory category (${facts.category}) differs from CMS (${actualProject.category?.name}).`);
          totalScore -= 0.4;
        }
      } catch {
        this.logger.warn(`Fact audit failed: Project ${projectSlug} not found in CMS.`);
      }
    }

    // 3. Design Compliance Audit: Use the 'director' to audit the last action
    if (history.length > 0) {
      const lastAction = history[history.length - 1].content;
      const auditResponse = await this.agentsService.chat(
        `AUDIT REQUEST: Review the following action for "Absolute Zero" luxury compliance: "${lastAction}". 
        Respond ONLY with a score (0-1) and a brief reason.`,
        'director',
        `audit-check-${sessionId}`,
      );

      const scoreMatch = auditResponse.response.match(/(\d\.\d+)/);
      const score = scoreMatch ? parseFloat(scoreMatch[0]) : 1.0;
      
      if (score < 0.7) {
        issues.push(`Design Non-Compliance: Director scored the last action as ${score}.`);
        totalScore = Math.min(totalScore, score);
      }
    }

    return {
      score: Math.max(0, totalScore),
      issues,
      status: totalScore > 0.8 ? 'PASS' : totalScore > 0.5 ? 'WARN' : 'FAIL',
    };
  }

  /**
   * Schedules a global audit for all active sessions to prevent "Agent Decay".
   */
  async runGlobalHealthCheck(): Promise<Record<string, AuditResult>> {
    this.logger.log('Running global cognitive health check...');
    // Implementation would iterate over active Redis sessions
    return {}; 
  }
}
