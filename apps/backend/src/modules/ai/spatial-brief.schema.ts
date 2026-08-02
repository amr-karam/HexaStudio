import { z } from 'zod';

/**
 * Zod schema for AI spatial synthesis briefs.
 *
 * Describes the curated lighting, material, color palette, and design rationale
 * recommended for a luxury architectural scene. Validated by
 * StructuredOutputService before being returned to clients.
 */
export const SpatialBriefSchema = z.object({
  atmosphere: z.string(),
  recommendedLighting: z.enum(['daylight', 'golden_hour', 'cyberpunk', 'gallery']),
  recommendedMaterial: z.enum([
    'obsidian_marble',
    'warm_oak',
    'brushed_titanium',
    'raw_concrete',
  ]),
  colorPalette: z.array(z.string()),
  designRationale: z.string(),
});

export type SpatialBrief = z.infer<typeof SpatialBriefSchema>;
