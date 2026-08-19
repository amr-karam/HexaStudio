// ─── AgentBadge ────────────────────────────────────────────────────────────
// Small badge showing which agent produced a message.

'use client';

const AGENT_ICONS: Record<string, string> = {
  'erp-analyst': '📊',
  'project-assistant': '📋',
  'sales-agent': '💼',
  'knowledge-agent': '📚',
};

const AGENT_COLORS: Record<string, string> = {
  'erp-analyst': 'var(--color-metric-amber)',
  'project-assistant': 'var(--color-info)',
  'sales-agent': 'var(--color-metric-emerald)',
  'knowledge-agent': 'var(--color-metric-violet)',
};

interface AgentBadgeProps {
  agentName: string;
  color?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function AgentBadge({ agentName, color, size = 'sm', showLabel = false }: AgentBadgeProps) {
  const icon = AGENT_ICONS[agentName] ?? '🤖';
  const badgeColor = color ?? AGENT_COLORS[agentName] ?? 'var(--color-secondary)';
  const sizeClass = size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs';

  return (
    <div
      className={`rounded-full flex items-center justify-center ${sizeClass}`}
      style={{
        backgroundColor: `${badgeColor}20`,
        color: badgeColor,
        border: `1px solid ${badgeColor}40`,
      }}
    >
      <span className="leading-none">{icon}</span>
      {showLabel && (
        <span className="ml-1.5 text-[10px] uppercase tracking-wider text-tertiary">
          {agentName.replace(/-/g, ' ')}
        </span>
      )}
    </div>
  );
}
