import type { Metadata } from 'next';
import DemoCodeBlock from '@/components/ui/DemoCodeBlock';

export const metadata: Metadata = {
  title: 'Demo | HexaStudio',
  description: 'Explore HexaStudio demo features and capabilities.',
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <main className="container mx-auto px-4 py-12">
        <DemoCodeBlock />
      </main>
    </div>
  );
}
