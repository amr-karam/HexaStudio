const API_BASE = '/api/v1/agents';

export type AgentPersonaType = 'ceo' | 'sales' | 'pm' | 'code-review';

export async function consultAgent(persona: AgentPersonaType, message: string): Promise<{ response: string; toolCalls: number }> {
  const res = await fetch(`${API_BASE}/${persona}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    throw new Error(`Failed to consult ${persona.toUpperCase()} agent`);
  }
  return res.json();
}
