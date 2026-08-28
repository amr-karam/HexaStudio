'use client';

/**
 * HEXA Portal — Quick Actions Grid
 *
 * Responsive grid of action cards with hover lift and gold accent borders.
 */

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { staggerContainer, fadeLift } from '@/lib/motion';
import { QuickAction } from './QuickAction';

interface QuickActionItem {
  icon: string;
  label: string;
  description: string;
  href: string;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  { icon: 'milestone', label: 'View Timeline', description: 'Track milestones and phase progress', href: '/portal/projects' },
  { icon: 'box', label: '3D Live Review', description: 'WebRTC spatial collaboration & pins', href: '/portal/review' },
  { icon: 'check-circle', label: 'Approvals & Contracts', description: 'E-signatures and deliverable sign-offs', href: '/portal/approvals' },
  { icon: 'folder-kanban', label: 'Documents Vault', description: 'Browse 8K renders and CAD assets', href: '/portal/documents' },
  { icon: 'dollar-sign', label: 'Finance & Invoices', description: 'Invoices, payments, and billing history', href: '/portal/finance' },
  { icon: 'sparkles', label: 'AI Spatial Studio', description: 'Multimodal prompts and render analysis', href: '/portal/ai' },
];

interface QuickActionsGridProps {
  prefersReduced: boolean;
}

export function QuickActionsGrid({ prefersReduced }: QuickActionsGridProps) {
  const router = useRouter();

  return (
    <motion.section
      aria-label="Quick actions"
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.05, 0)}
    >
      <h2 className="text-base font-bold text-sl-alabaster mb-4">
        Quick Actions
      </h2>
      <motion.div
        variants={staggerContainer(0.05, 0.05)}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
      >
        {QUICK_ACTIONS.map((action) => (
          <motion.div
            key={action.label}
            variants={fadeLift}
            custom={prefersReduced}
          >
            <QuickAction
              icon={action.icon as never}
              label={action.label}
              description={action.description}
              onClick={() => router.push(action.href)}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
