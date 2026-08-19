import { z } from 'zod';
import { AgentTool } from '../types/agent.types';

// ─── Zod Schemas for Tool Arguments ──────────────────────────────────────────

export const SearchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 25),
});

export const QuerySchema = z.object({
  model: z.string().min(1, 'Model name is required'),
  domain: z.string().optional().default('[]').transform(val => JSON.parse(val)),
  fields: z.string().optional().default('[]').transform(val => JSON.parse(val)),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
});

export const LeadSchema = z.object({
  name: z.string().min(1),
  contact_name: z.string().optional(),
  email_from: z.string().email().optional(),
  phone: z.string().optional(),
  planned_revenue: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  stage_id: z.string().optional(),
  source: z.string().optional(),
  service: z.string().optional(),
});

export const DocumentSearchSchema = z.object({
  query: z.string().min(1),
  topK: z.string().optional().transform(val => val ? parseInt(val, 10) : 5),
  collection: z.string().optional().default('default'),
});

export const ProposalSchema = z.object({
  clientName: z.string().min(1),
  projectName: z.string().min(1),
  scope: z.string().min(1),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

// ─── Tool Factory ───────────────────────────────────────────────────────────

export function createTool(
  name: string,
  description: string,
  parameters: Record<string, unknown>,
  required: string[],
  handler: (args: Record<string, string>) => Promise<string>,
  schema?: z.ZodSchema,
): AgentTool {
  return {
    definition: {
      name,
      description,
      parameters: {
        type: 'object',
        properties: parameters,
        required,
      },
    },
    handler,
    schema,
  };
}

// ─── Helper: Safe JSON parse ────────────────────────────────────────────────

export function safeJsonParse(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// ─── Helper: Format results for LLM ─────────────────────────────────────────

export function formatResults(data: unknown, limit: number): string {
  if (!data) return 'No data found.';
  const arr = Array.isArray(data) ? data : [data];
  const limited = arr.slice(0, limit);
  return JSON.stringify(limited, null, 2);
}
