import { Injectable, Logger } from '@nestjs/common';

/**
 * AI Narrator Service
 * 
 * Responsible for managing the "Voice" and "Personality" of the AI across 
 * the platform, specifically the "Silent Luxury" reporting style.
 * 
 * Silent Luxury Guidelines:
 * 1. Understated: Avoid superlatives (e.g., "amazing", "incredible", "revolutionary").
 * 2. Authoritative: Use direct, precise architectural and financial terminology.
 * 3. Outcome-Focused: Prioritize results over effort.
 * 4. Precise: Use specific numbers and dates rather than vague descriptors.
 */
@Injectable()
export class AiNarratorService {
  private readonly logger = new Logger(AiNarratorService.name);

  /**
   * Generates a high-fidelity prompt for the Executive Report.
   * This prompt enforces the "Silent Luxury" constraints.
   */
  generateExecutiveReportPrompt(projectData: {
    name: string;
    timeline: { stage: string; progress: number };
    finance: { budget: unknown; spent: unknown };
    deliverables: unknown[];
  }): string {
    return `
      You are the Executive AI Lead at HEXA STUDIO. Your task is to synthesize a Project State Report.
      
      PROJECT DATA:
      - Name: ${projectData.name}
      - Timeline: ${projectData.timeline.stage}, ${projectData.timeline.progress}% complete.
      - Finance: Budget ${String(projectData.finance.budget)}, Spent ${String(projectData.finance.spent)}.
      - Deliverables: ${projectData.deliverables.length} items processed.

      VOICE GUIDELINES (Silent Luxury):
      - TONE: Understated, authoritative, and precise.
      - RESTRICTIONS: 
        - ABSOLUTELY NO superlatives (e.g., "incredible", "amazing", "fantastic").
        - NO filler words or corporate fluff (e.g., "we are excited to announce", "pleased to share").
        - NO emojis.
      - FOCUS: 
        - Use architectural and financial terminology (e.g., "spatial synthesis", "burn rate", "BIM synchronization").
        - Focus on outcomes and risks.
        - Be direct. If a project is delayed, state it clearly without cushioning the blow, but provide the specific intervention.

      REPORT STRUCTURE:
      1. Executive Summary: A concise, 2-3 sentence narrative of the project's current standing.
      2. Metrics: Synthesize the raw data into health statuses (on-track, at-risk, delayed).
      3. Highlights: Identify the 3 most impactful achievements since the last report.
      4. Interventions: Propose the most critical proactive steps needed to maintain the trajectory.
      5. Visualization Cues: Suggest specific areas of the 3D model that should be highlighted to reflect the current state.

      Output must follow the ExecutiveReport JSON schema strictly.
    `;
  }

  /**
   * Refines a piece of AI-generated text to ensure it adheres to Silent Luxury guidelines.
   * Useful for post-processing narratives that might have slipped into "AI-speak".
   */
  async refineToSilentLuxury(text: string): Promise<string> {
    this.logger.debug('Refining narrative to Silent Luxury standards...');
    
    // In a real implementation, this would be a secondary LLM call with a "critique and refine" prompt.
    // For now, we implement a basic rule-based cleanup for common AI superlatives.
    const superlatives = [/incredible/gi, /amazing/gi, /fantastic/gi, /revolutionary/gi, /excited/gi, /pleased/gi];
    let refined = text;
    
    superlatives.forEach(regex => {
      refined = refined.replace(regex, '');
    });

    return refined.trim();
  }
}
