/**
 * egyptian-materials.interface.ts
 * TypeScript interface for Egyptian materials (shared between backend + frontend)
 * HEXA Studio — Sprint S022.3
 */

export interface MaterialTextureHints {
  pattern: string;
  finish: string;
  origin: string;
}

export interface EgyptianMaterial {
  id: string;
  name: string;
  category: "wood" | "stone" | "fabric" | "metal";
  description: string;
  basePriceEGP: number;
  unit: string;
  roughness: number;
  metalness: number;
  color: string;
  textureHints: MaterialTextureHints;
  culturalNote: string;
}
