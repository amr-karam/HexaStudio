import type { Metadata } from 'next';
import { LayoutShell } from '@/components/LayoutShell';

export const metadata: Metadata = {
  title: 'Design System — Evey Design',
  description: 'HEXA STUDIO design system tokens: colors, glassmorphism, typography, and motion easings.',
  robots: { index: false, follow: false },
};

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return <LayoutShell>{children}</LayoutShell>;
}
