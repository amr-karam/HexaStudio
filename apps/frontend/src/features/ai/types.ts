export interface ArchitecturalAnalysis {
  style: string;
  materials: string[];
  lighting: string;
  spatialComposition: string;
  suggestions: string[];
  confidence: number;
}

export interface Scene3DAnalysis {
  visualQuality: string;
  lightingQuality: string;
  materialRealism: string;
  composition: string;
  improvements: string[];
  technicalNotes: string[];
}

export interface MaterialAnalysis {
  materialType: string;
  colorPalette: string[];
  textureCharacteristics: string[];
  suitableApplications: string[];
  sustainabilityScore: number;
  maintenanceNotes: string[];
}

export interface DesignComparison {
  similarityScore: number;
  sharedElements: string[];
  differences: string[];
  stylisticRelationship: string;
  recommendation: string;
}

export interface BIMExtraction {
  detectedElements: Array<{
    type: string;
    count: number;
    confidence: number;
  }>;
  viewType: string;
  scale: string;
  layerInformation: string[];
  potentialIssues: string[];
}
