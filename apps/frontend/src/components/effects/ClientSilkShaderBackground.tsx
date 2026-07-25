'use client';

import dynamic from 'next/dynamic';

const SilkShaderBackground = dynamic(
  () => import('@/components/effects/SilkShaderBackground'),
  { ssr: false }
);

interface ClientSilkShaderProps {
  speed?: number;
  opacity?: number;
  className?: string;
}

export function ClientSilkShaderBackground(props: ClientSilkShaderProps) {
  return <SilkShaderBackground {...props} />;
}
