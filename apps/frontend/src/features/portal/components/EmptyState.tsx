'use client';

/**
 * HEXA Portal — Empty State
 *
 * Centered empty state with an icon, title, and description.
 * Used when dashboard sections have no data.
 */

import { Icon } from './PortalIcons';
import type { IconName } from './PortalIcons';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-sl-silver/20 flex items-center justify-center mb-4">
        <Icon name={icon} size={22} className="text-sl-silver" />
      </div>
      <p className="text-sm font-medium text-sl-warm-neutral">{title}</p>
      <p className="text-xs text-sl-silver mt-1 max-w-[220px]">{description}</p>
    </div>
  );
}
