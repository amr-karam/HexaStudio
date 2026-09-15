/**
 * materials-data.ts — Egyptian materials pricing + full list
 * HEXA Studio — Sprint S022.4
 *
 * Single source of truth for cost-estimator module.
 * Consumers use: getEGPCostLookup(), getAllMaterials(), getMaterial(id)
 */

import type { EgyptianMaterial } from "../../data/materials/egyptian-materials.interface";

export const ALL_MATERIALS: EgyptianMaterial[] = [
  {
    id: "nile-lotus-wood",
    name: "Nile Lotus Wood",
    category: "wood",
    description: "Traditional Egyptian decorative wood, hand-carved lotus motifs.",
    basePriceEGP: 850,
    unit: "m²",
    roughness: 0.55,
    metalness: 0.0,
    color: "#d4a574",
    textureHints: { pattern: "lotus grain", finish: "matte", origin: "Egypt" },
    culturalNote: "Lotus motif symbolises rebirth in ancient Egyptian art.",
  },
  {
    id: "egyptian-granite",
    name: "Egyptian Granite",
    category: "stone",
    description: "Aswan quarried granite, polished or flamed finish.",
    basePriceEGP: 1200,
    unit: "m²",
    roughness: 0.4,
    metalness: 0.2,
    color: "#4a4a4a",
    textureHints: { pattern: "crystalline grain", finish: "polished", origin: "Aswan" },
    culturalNote: "Aswan granite was used for obelisks and temple flooring.",
  },
  {
    id: "papyrus-fabric",
    name: "Papyrus Weave Fabric",
    category: "fabric",
    description: "Handwoven linen with papyrus-stalk pattern, natural ivory tone.",
    basePriceEGP: 320,
    unit: "m²",
    roughness: 0.85,
    metalness: 0.0,
    color: "#f0e6d2",
    textureHints: { pattern: "papyrus weave", finish: "matte", origin: "Nile Delta" },
    culturalNote: "Linen was the most common textile in ancient Egypt.",
  },
  {
    id: "pharaoh-bronze",
    name: "Pharaoh Bronze",
    category: "metal",
    description: "Reclaimed bronze with patina, sand-cast details.",
    basePriceEGP: 2100,
    unit: "m²",
    roughness: 0.6,
    metalness: 0.85,
    color: "#8a5a2b",
    textureHints: { pattern: "sand-cast grain", finish: "oxidised", origin: "Egypt" },
    culturalNote: "Bronze statuary dates to the Old Kingdom; patina valued as age evidence.",
  },
];

export function getEGPCostLookup(): Record<string, number> {
  const lookup: Record<string, number> = {};
  for (const m of ALL_MATERIALS) {
    lookup[m.id] = m.basePriceEGP;
  }
  return lookup;
}

export const EGP_COST_LOOKUP = getEGPCostLookup();  // populated once at module load; kept for external consumers that import the function directly

export function getAllMaterials(): EgyptianMaterial[] {
  return ALL_MATERIALS;
}

export function getMaterial(id: string): EgyptianMaterial | undefined {
  return ALL_MATERIALS.find((m) => m.id === id);
}
