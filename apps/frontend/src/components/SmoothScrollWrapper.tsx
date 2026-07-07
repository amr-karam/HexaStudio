'use client';
import dynamic from 'next/dynamic';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then((mod) => ({ default: mod.SmoothScroll })), { ssr: false });

export function SmoothScrollWrapper({ children }: { children: React.ReactNode }) {
  return <SmoothScroll>{children}</SmoothScroll>;
}
