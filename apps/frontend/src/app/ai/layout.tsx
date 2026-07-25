import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Architectural Assistant | HexaStudio',
  description:
    'Experience HexaStudio AI — intelligent spatial analysis, material suggestions, and real-time architectural design conversation.',
  openGraph: {
    title: 'AI Architectural Assistant | HexaStudio',
    description:
      'Experience HexaStudio AI — intelligent spatial analysis, material suggestions, and real-time architectural design conversation.',
  },
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
