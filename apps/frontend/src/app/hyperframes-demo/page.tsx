import { createMetadata } from '@/lib/seo';
import { HyperFramesDemoClient } from './HyperFramesDemoClient';

export const metadata = createMetadata({
  title: 'HyperFrames Demo',
  description:
    'HyperFrames cinematic composition engine — integrated into HexaStudio for programmatic, deterministic motion design.',
  path: '/hyperframes-demo',
});

export default function HyperFramesDemoPage() {
  return <HyperFramesDemoClient />;
}
