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

export interface FusionRequestPayload {
  messages: Array<{ role: string; content: string }>;
  models?: string[];
  mode?: 'best' | 'merge';
  maxTokens?: number;
  weights?: {
    quality?: number;
    latency?: number;
    structure?: number;
  };
}

export interface FusionCandidateUI {
  provider: string;
  model: string;
  content: string;
  score: number;
  rank: number;
  latencyMs: number;
  failure?: boolean;
  error?: string;
  status?: 'pending' | 'running' | 'done' | 'error';
}

export interface FusionResponseUI {
  fused: {
    content: string;
    model: string;
    provider: string;
    mode: 'best' | 'merge';
  };
  candidates: FusionCandidateUI[];
  winnerScore: number;
  telemetry: {
    totalCandidates: number;
    successfulCandidates: number;
    failedCandidates: number;
    totalLatencyMs: number;
    winnerLatencyMs: number;
  };
}

export async function runFusion(payload: FusionRequestPayload): Promise<FusionResponseUI> {
  const res = await fetch(`${API_BASE.replace('/multimodal', '')}/fusion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Fusion request failed');
  return res.json();
}

export interface FusionStreamStart {
  type: 'meta';
  payload: { mode: 'best' | 'merge'; models: string[]; weights?: FusionRequestPayload['weights'] };
}

export interface FusionCandidateStreamEvent {
  type: 'candidate_start';
  payload: { model: string; index: number };
}

export interface FusionCandidateMetaStreamEvent {
  type: 'candidate_meta';
  payload: { model: string; provider: string; maxTokens: number };
}

export interface FusionCandidateDeltaStreamEvent {
  type: 'candidate_delta';
  payload: { model: string; text: string };
}

export interface FusionCandidateDoneStreamEvent {
  type: 'candidate_done';
  payload: {
    model: string;
    provider: string;
    content: string;
    latencyMs: number;
    usage?: { promptTokens?: number; completionTokens?: number };
  };
}

export interface FusionResultStreamEvent {
  type: 'result';
  payload: {
    fused: { content: string; model: string; provider: string; mode: 'best' | 'merge' };
    winnerScore: number;
    telemetry: {
      totalCandidates: number;
      successfulCandidates: number;
      failedCandidates: number;
      totalLatencyMs: number;
      winnerLatencyMs: number;
    };
  };
}

export interface FusionDoneStreamEvent {
  type: 'done';
  payload: Record<string, never>;
}

export interface FusionErrorStreamEvent {
  type: 'error';
  payload: { message: string };
}

export interface FusionCandidateErrorStreamEvent {
  type: 'candidate_error';
  payload: { model: string; error?: string };
}

export type FusionStreamEvent =
  | FusionStreamStart
  | FusionCandidateStreamEvent
  | FusionCandidateMetaStreamEvent
  | FusionCandidateDeltaStreamEvent
  | FusionCandidateDoneStreamEvent
  | FusionCandidateErrorStreamEvent
  | FusionResultStreamEvent
  | FusionDoneStreamEvent
  | FusionErrorStreamEvent;

function parseStreamEvent(eventName: string, data: string): FusionStreamEvent {
  const parsed = JSON.parse(data);

  switch (eventName) {
    case 'meta':
      return { type: 'meta', payload: parsed as FusionStreamStart['payload'] };
    case 'candidate_start':
      return { type: 'candidate_start', payload: parsed as FusionCandidateStreamEvent['payload'] };
    case 'candidate_meta':
      return { type: 'candidate_meta', payload: parsed as FusionCandidateMetaStreamEvent['payload'] };
    case 'candidate_delta':
      return { type: 'candidate_delta', payload: parsed as FusionCandidateDeltaStreamEvent['payload'] };
    case 'candidate_done':
      return { type: 'candidate_done', payload: parsed as FusionCandidateDoneStreamEvent['payload'] };
    case 'result':
      return { type: 'result', payload: parsed as FusionResultStreamEvent['payload'] };
    case 'done':
      return { type: 'done', payload: parsed as FusionDoneStreamEvent['payload'] };
    case 'error':
      return { type: 'error', payload: parsed as FusionErrorStreamEvent['payload'] };
    default:
      return { type: 'error', payload: { message: `Unknown stream event: ${eventName}` } };
  }
}

export async function* runFusionStream(
  payload: FusionRequestPayload,
): AsyncGenerator<FusionStreamEvent> {
  const res = await fetch(`${API_BASE.replace('/multimodal', '')}/fusion/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Fusion stream request failed');
  }

  if (!res.body) {
    throw new Error('Fusion stream response body is unavailable');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) {
          continue;
        }

        if (!trimmed.startsWith('event: ') || !trimmed.includes('\ndata: ')) {
          continue;
        }

        const eventLine = trimmed.split('\n')[0] ?? '';
        const dataLine = trimmed.split('\n').find((segment) => segment.startsWith('data: ')) ?? '';
        const eventName = eventLine.replace('event: ', '').trim();
        const data = dataLine.replace('data: ', '').trim();

        if (!eventName || !data) {
          continue;
        }

        yield parseStreamEvent(eventName, data);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
