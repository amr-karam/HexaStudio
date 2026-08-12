import { NextResponse } from 'next/server';
import { authenticatedFetch } from '@/lib/api-client';
import { API_BASE_URL } from '@/config/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Attempt calling NestJS BFF spatial synthesis endpoint with authentication
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/v1/ai/spatial-synthesis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      // Degrade gracefully if backend AI service is offline or auth fails
      console.warn('Backend AI service unavailable, using fallback:', error);
    }

    // Intelligent AI Spatial Synthesis engine fallback
    const promptLower = prompt.toLowerCase();
    let recommendedLighting: 'daylight' | 'golden_hour' | 'cyberpunk' | 'gallery' = 'golden_hour';
    let recommendedMaterial: 'obsidian_marble' | 'warm_oak' | 'brushed_titanium' | 'raw_concrete' = 'obsidian_marble';
    let colorPalette = ['#121212', '#D4AF37', '#707070', '#F5F5F7'];
    let atmosphere = 'Sophisticated Luxury & Spatial Balance';

    if (promptLower.includes('minimal') || promptLower.includes('concrete') || promptLower.includes('nordic')) {
      recommendedLighting = 'daylight';
      recommendedMaterial = 'raw_concrete';
      colorPalette = ['#4A4A4A', '#808080', '#E5E5E5', '#222222'];
      atmosphere = 'Raw Architectural Minimalism';
    } else if (promptLower.includes('warm') || promptLower.includes('timber') || promptLower.includes('wood') || promptLower.includes('cozy')) {
      recommendedLighting = 'golden_hour';
      recommendedMaterial = 'warm_oak';
      colorPalette = ['#8B5A2B', '#D4AF37', '#2C1A0E', '#F5E6D3'];
      atmosphere = 'Organic Warmth & Biophilic Harmony';
    } else if (promptLower.includes('futuristic') || promptLower.includes('neon') || promptLower.includes('cyber') || promptLower.includes('dark')) {
      recommendedLighting = 'cyberpunk';
      recommendedMaterial = 'brushed_titanium';
      colorPalette = ['#0D0D15', '#00E5FF', '#BD00FF', '#707070'];
      atmosphere = 'High-Tech Metallic & Ambient Contrast';
    } else if (promptLower.includes('gallery') || promptLower.includes('museum') || promptLower.includes('spotlight')) {
      recommendedLighting = 'gallery';
      recommendedMaterial = 'obsidian_marble';
      colorPalette = ['#000000', '#FFFFFF', '#D4AF37', '#333333'];
      atmosphere = 'Dramatic Gallery Spotlight Focus';
    }

    const brief = {
      atmosphere,
      recommendedLighting,
      recommendedMaterial,
      colorPalette,
      designRationale: `Synthesized spatial design specification for "${prompt}". Applied ${recommendedLighting.replace('_', ' ')} lighting paired with ${recommendedMaterial.replace('_', ' ')} surfaces to establish optimal depth, material contrast, and spatial luxury.`,
    };

    return NextResponse.json({ brief });
  } catch {
    return NextResponse.json(
      { error: 'Failed to synthesize spatial brief' },
      { status: 500 },
    );
  }
}
