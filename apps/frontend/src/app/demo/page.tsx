import { createMetadata } from '@/lib/seo';
import DemoCodeBlock from '@/components/ui/DemoCodeBlock';

export const metadata = createMetadata({
  title: 'Demo',
  description: 'Explore HexaStudio demo features and capabilities — architectural visualization components and interactive showcases.',
  path: '/demo',
});

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-sl-void text-sl-alabaster pt-28 pb-20">
      <section className="max-w-5xl mx-auto px-6 md:px-8" aria-label="Demo showcase">
        <DemoCodeBlock />
      </section>
    </div>
  );
}
