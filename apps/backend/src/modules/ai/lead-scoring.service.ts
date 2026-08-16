import { Injectable, Logger } from '@nestjs/common';
import { StructuredOutputService } from './structured-output.service';
import { LeadScore, LeadScoreSchema } from './lead-score.schema';
import { sanitizePrompt } from './llm.factory';

/**
 * LeadScoringService
 *
 * Analyzes incoming architectural-studio inquiries with Gemini and produces a
 * structured lead classification (tier, score, budget range, priority) so the
 * sales team can route follow-up immediately. Uses StructuredOutputService for
 * deterministic, Zod-validated output.
 *
 * This service is stateless — the caller (ContactService) is responsible for
 * persisting the result to Odoo and/or Redis.
 */
@Injectable()
export class LeadScoringService {
  private readonly logger = new Logger(LeadScoringService.name);

  constructor(private readonly structuredOutputService: StructuredOutputService) {}

  /**
   * Score an incoming lead based on the inquiry details.
   *
   * @param lead  Raw lead fields captured from the contact form.
   * @returns    A validated LeadScore classification.
   */
  async scoreLead(lead: {
    name: string;
    company?: string;
    email: string;
    service?: string;
    budget?: string;
    location?: string;
    message: string;
  }): Promise<LeadScore> {
    // Sanitize every user-supplied field before it is interpolated into the
    // prompt (trim + strip control characters) — never pass raw input to the model.
    const name = sanitizePrompt(lead.name);
    const company = lead.company ? sanitizePrompt(lead.company) : undefined;
    const email = sanitizePrompt(lead.email);
    const service = lead.service ? sanitizePrompt(lead.service) : undefined;
    const budget = lead.budget ? sanitizePrompt(lead.budget) : undefined;
    const location = lead.location ? sanitizePrompt(lead.location) : undefined;
    const message = sanitizePrompt(lead.message);

    const prompt = `You are an expert lead qualification analyst for a high-end architectural visualization studio ("Hexa Studio").

Analyze the following client inquiry and classify it for our sales team:

- Name: ${name}
- Company: ${company || 'N/A'}
- Email: ${email}
- Service interest: ${service || 'General'}
- Budget indicator: ${budget || 'Unspecified'}
- Location: ${location || 'Unknown'}
- Message: ${message}

A "high_value" lead is typically: a luxury residential/commercial project, a clear budget above $250k, a named architect/developer, or a portfolio-style masterplan.
A "strategic" lead may be a high-potential but early-stage inquiry (e.g., feasibility, multi-site, brand collaboration).
A "low_fit" lead is a mismatch for a premium studio (e.g., tiny render job, student project, freelancer seeking work).
Otherwise classify as "inquiry".

Return:
- tier: high_value | strategic | low_fit | inquiry
- score: integer 0-100 (probability-adjusted value of this lead)
- estimatedBudgetRange: <50k | 50k-250k | 250k-1m | 1m+ | unknown
- projectComplexity: low | medium | high | unknown
- locationFit: local | regional | international | unknown
- recommendedPriority: immediate_follow_up | schedule_this_week | nurture | low_priority
- reasons: 1-6 concise strings explaining the classification`;

    this.logger.debug(`Scoring lead for ${email}`);

    return this.structuredOutputService.generateStructuredOutput(
      prompt,
      LeadScoreSchema,
      { temperature: 0.2, maxTokens: 700 },
    );
  }

  /**
   * Convenience wrapper to map a LeadScore to Odoo-facing tag strings.
   */
  toTags(score: LeadScore): string[] {
    const tags: string[] = [score.tier];
    tags.push(`score:${score.score}`);
    tags.push(`budget:${score.estimatedBudgetRange}`);
    tags.push(`complexity:${score.projectComplexity}`);
    tags.push(`priority:${score.recommendedPriority}`);
    return tags;
  }
}
