import type { Metadata } from 'next';
import DemoCodeBlock from '@/components/ui/DemoCodeBlock';

export const metadata: Metadata = {
  title: 'Demo',
  description: 'Explore HexaStudio demo features and capabilities.',
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20">
      <main className="max-w-5xl mx-auto px-6 md:px-8">
        <DemoCodeBlock />
      </main>
    </div>
  );
}
