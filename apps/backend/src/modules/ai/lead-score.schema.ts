import { z } from 'zod';

/**
 * Zod schema for autonomous lead scoring output.
 *
 * The AI classifies an incoming architectural-studio inquiry into a tier,
 * assigns a numeric score, and emits the reasoning used so the sales team
 * can act on it immediately. Validated by StructuredOutputService.
 */
export const LeadScoreSchema = z.object({
  tier: z.enum(['high_value', 'strategic', 'low_fit', 'inquiry']),
  score: z.number().min(0).max(100),
  estimatedBudgetRange: z.enum(['<50k', '50k-250k', '250k-1m', '1m+', 'unknown']),
  projectComplexity: z.enum(['low', 'medium', 'high', 'unknown']),
  locationFit: z.enum(['local', 'regional', 'international', 'unknown']),
  recommendedPriority: z.enum(['immediate_follow_up', 'schedule_this_week', 'nurture', 'low_priority']),
  reasons: z.array(z.string()).min(1).max(6),
});

export type LeadScore = z.infer<typeof LeadScoreSchema>;
