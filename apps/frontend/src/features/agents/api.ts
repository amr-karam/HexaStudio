const API_BASE = '/api/v1/agents';

export type AgentPersonaType = 'ceo' | 'sales' | 'pm' | 'code-review';

export interface AgentConsultResponse {
  response: string;
  toolCalls: number;
  sessionId: string;
}

export async function consultAgent(
  persona: AgentPersonaType,
  message: string,
  sessionId?: string
): Promise<AgentConsultResponse> {
  const res = await fetch(`${API_BASE}/${persona}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
  });
  if (!res.ok) {
    throw new Error(`Failed to consult ${persona.toUpperCase()} agent`);
  }
  return res.json() as Promise<AgentConsultResponse>;
}

export async function clearAgentMemory(
  persona: AgentPersonaType,
  sessionId?: string
): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/memory`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ persona, sessionId }),
  });
  if (!res.ok) {
    throw new Error(`Failed to clear memory for ${persona.toUpperCase()}`);
  }
  return res.json() as Promise<{ ok: boolean }>;
}
