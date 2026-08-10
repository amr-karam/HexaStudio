import { z } from 'zod';

/**
 * Zod schema for predictive timeline / delay analysis output.
 *
 * Produced by TimelinePredictorService from historical Odoo project data plus
 * the current progress of a live project. Validated by StructuredOutputService.
 */
export const TimelinePredictionSchema = z.object({
  riskScore: z.number().min(0).max(100),
  predictedDelayDays: z.number().min(0).max(365),
  confidence: z.number().min(0).max(1),
  riskLevel: z.enum(['on_track', 'watch', 'at_risk', 'critical']),
  predictedCompletionDate: z.string().optional(),
  factors: z.array(z.string()).min(1).max(6),
  recommendedActions: z.array(z.string()).min(1).max(4),
});

export type TimelinePrediction = z.infer<typeof TimelinePredictionSchema>;
