import {
  ArchitecturalAnalysis,
  Scene3DAnalysis,
  MaterialAnalysis,
  DesignComparison,
  BIMExtraction,
} from './types';

const API_BASE = '/api/v1/ai/multimodal';

export async function analyzeArchitecture(imageData: string, mimeType = 'image/jpeg'): Promise<ArchitecturalAnalysis> {
  const res = await fetch(`${API_BASE}/analyze-architecture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, mimeType }),
  });
  if (!res.ok) throw new Error('Architectural analysis failed');
  return res.json();
}

export async function analyze3DScene(imageData: string, mimeType = 'image/png'): Promise<Scene3DAnalysis> {
  const res = await fetch(`${API_BASE}/analyze-3d-scene`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, mimeType }),
  });
  if (!res.ok) throw new Error('3D scene analysis failed');
  return res.json();
}

export async function analyzeMaterial(imageData: string, mimeType = 'image/jpeg'): Promise<MaterialAnalysis> {
  const res = await fetch(`${API_BASE}/analyze-material`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, mimeType }),
  });
  if (!res.ok) throw new Error('Material analysis failed');
  return res.json();
}

export async function compareDesigns(
  image1Data: string,
  image2Data: string,
  mimeType = 'image/jpeg'
): Promise<DesignComparison> {
  const res = await fetch(`${API_BASE}/compare-designs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image1Data, image2Data, mimeType }),
  });
  if (!res.ok) throw new Error('Design comparison failed');
  return res.json();
}

export async function extractBIM(imageData: string, mimeType = 'image/png'): Promise<BIMExtraction> {
  const res = await fetch(`${API_BASE}/extract-bim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, mimeType }),
  });
  if (!res.ok) throw new Error('BIM extraction failed');
  return res.json();
}
