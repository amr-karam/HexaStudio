/**
 * MaterialLibrary.ts
 * Bridges egyptian-materials.json → Three.js material properties
 * HEXA Studio — Sprint S022.1
 * Created: 2026-09-10
 */

import { Color, MeshStandardMaterial } from 'three'
import rawData from '../data/materials/egyptian-materials.json'

// Type definitions — strict, compile-time safe
export interface MaterialTextureHints {
  pattern: string
  finish: string
  origin: string
}

export interface EgyptianMaterial {
  id: string
  name: string
  category: 'wood' | 'stone' | 'fabric' | 'metal'
  description: string
  basePriceEGP: number
  unit: string
  roughness: number
  metalness: number
  color: string
  textureHints: MaterialTextureHints
  culturalNote: string
}

export interface MaterialPriceInfo {
  material: EgyptianMaterial
  totalEGP: number
  areaSqm: number
}

// Raw JSON data — typed at import
const materialsData: EgyptianMaterial[] = rawData as unknown as EgyptianMaterial[]

/**
 * Get all Egyptian materials
 * @returns EgyptianMaterial[] — all 5 materials
 */
export function getAllMaterials(): EgyptianMaterial[] {
  return materialsData
}

/**
 * Get a material by its ID
 * @param id — e.g. "mashrabiya-wood", "limestone-nile"
 * @returns EgyptianMaterial | null
 */
export function getMaterial(id: string): EgyptianMaterial | null {
  const found = materialsData.find((m) => m.id === id)
  if (!found) {
    console.warn(`[MaterialLibrary] Material not found: ${id}`)
    return null
  }
  return found
}

/**
 * Group materials by category
 * @returns Record<category, EgyptianMaterial[]>
 */
export function getMaterialsByCategory(): Record<string, EgyptianMaterial[]> {
  const categories: Record<string, EgyptianMaterial[]> = {}
  materialsData.forEach((m) => {
    if (!categories[m.category]) categories[m.category] = []
    categories[m.category].push(m)
  })
  return categories
}

/**
 * Create a Three.js MeshStandardMaterial from an EgyptianMaterial
 * @param material — EgyptianMaterial
 * @returns MeshStandardMaterial configured with roughness/metalness/color
 */
export function getThreeJSMaterial(material: EgyptianMaterial): MeshStandardMaterial {
  return new MeshStandardMaterial({
    roughness: material.roughness,
    metalness: material.metalness,
    color: new Color(material.color),
    // Normal map placeholder — can be populated with texture URLs
  })
}

/**
 * Get Three.js material by ID
 * @param id — material ID
 * @returns MeshStandardMaterial | null
 */
export function getThreeJSMaterialById(id: string): MeshStandardMaterial | null {
  const material = getMaterial(id)
  if (!material) return null
  return getThreeJSMaterial(material)
}

/**
 * Calculate total material cost for a given area
 * @param materialId — e.g. "granite-red-aswan"
 * @param areaSqm — surface area in square meters
 * @returns MaterialPriceInfo
 */
export function calculateMaterialCost(
  materialId: string,
  areaSqm: number
): MaterialPriceInfo | null {
  const material = getMaterial(materialId)
  if (!material) return null
  return {
    material,
    totalEGP: material.basePriceEGP * areaSqm,
    areaSqm,
  }
}

/**
 * Get all EGP prices as a lookup map
 * @returns Record<materialId, basePriceEGP>
 */
export function getEGPCostLookup(): Record<string, number> {
  const lookup: Record<string, number> = {}
  materialsData.forEach((m) => {
    lookup[m.id] = m.basePriceEGP
  })
  return lookup
}

export { materialsData as rawMaterials }
export default getMaterial
