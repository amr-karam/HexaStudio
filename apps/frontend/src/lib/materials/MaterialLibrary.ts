'use client';

import * as THREE from 'three';
import egyptianMaterials from '@/data/materials/egyptian-materials.json';

export interface MaterialDefinition {
  id: string;
  name: string;
  category: string;
  localName: { en: string; ar: string };
  properties: {
    roughness: number;
    metalness: number;
    porosity: number;
  };
  egyptianOrigin: string;
  estimatedCostEGP: {
    material: number;
    installation: number;
  };
  usage: string;
}

export interface MaterialWithTextures extends MaterialDefinition {
  textureUrls: Record<string, string>;
}

export class MaterialLibrary {
  private static materials: Record<string, MaterialWithTextures> = {};

  static {
    for (const m of egyptianMaterials.materials) {
      this.materials[m.id] = m;
    }
  }

  static get(id: string): MaterialWithTextures | undefined {
    return this.materials[id];
  }

  static list(): MaterialWithTextures[] {
    return Object.values(this.materials);
  }

  static byCategory(category: string): MaterialWithTextures[] {
    return Object.values(this.materials).filter((m) => m.category === category);
  }

  static getThreeJSMaterial(id: string): THREE.MeshStandardMaterial | undefined {
    const def = this.materials[id];
    if (!def) return undefined;

    return new THREE.MeshStandardMaterial({
      roughness: def.properties.roughness,
      metalness: def.properties.metalness,
      color: new THREE.Color(
        def.category === 'Stone' ? '#D4AF37' :
        def.category === 'Wood' ? '#8B4513' :
        '#F5F5DC'
      ),
    });
  }

  static getEGPPrice(id: string): number | null {
    const def = this.materials[id];
    if (!def) return null;
    return def.estimatedCostEGP.material + def.estimatedCostEGP.installation;
  }
}
